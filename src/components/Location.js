import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { LocationContext } from '../lib/context';
import { globalHistory } from '../lib/history';
import { isRedirect } from '../lib/redirect';
import { errorBoundary } from '../lib/utils';

////////////////////////////////////////////////////////////////////////////////

// sets up a listener if there isn't one already so apps don't need to be
// wrapped in some top level provider
function Location({ children }) {
  const context = useContext(LocationContext);
  return context ? (
    children(context)
  ) : (
    <LocationProvider>{children}</LocationProvider>
  );
}

function LocationProviderImpl({ children, history = globalHistory }) {
  const unmounted = useRef();
  const getContext = useCallback(() => {
    return {
      navigate: history.navigate,
      location: history.location,
    };
  }, [history]);
  const [context, setContext] = useState(getContext());

  useLayoutEffect(() => {
    unmounted.current = false;
    let unlisten = history.listen(() => {
      Promise.resolve().then(() => {
        // TODO: replace rAF with react deferred update API when it's ready
        // https://github.com/facebook/react/issues/13306
        requestAnimationFrame(() => {
          if (!unmounted.current) {
            setContext(getContext());
          }
        });
      });
    });
    return () => {
      unmounted.current = true;
      unlisten();
    };
  }, [getContext, history]);

  useLayoutEffect(() => {
    history._onTransitionComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.location]);

  return (
    <LocationContext.Provider value={context}>
      {typeof children === 'function' ? children(context) : children || null}
    </LocationContext.Provider>
  );
}

function LocationProvider({ history = globalHistory, ...props }) {
  function handleError(error) {
    if (isRedirect(error)) {
      let { navigate } = history;
      navigate(error.uri, { replace: true });
    } else {
      throw error;
    }
  }

  let Comp = errorBoundary(
    <LocationProviderImpl history={history} {...props} />,
    handleError
  );

  return <Comp />;
}

////////////////////////////////////////////////////////////////////////////////

function ServerLocation({ url, children }) {
  let searchIndex = url.indexOf('?');
  let searchExists = searchIndex > -1;
  let pathname;
  let search = '';
  let hash = '';

  if (searchExists) {
    pathname = url.substring(0, searchIndex);
    search = url.substring(searchIndex);
  } else {
    pathname = url;
  }

  return (
    <LocationContext.Provider
      value={{
        location: {
          pathname,
          search,
          hash,
        },
        navigate: () => {
          throw new Error("You can't call navigate on the server.");
        },
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

if (__DEV__) {
  ServerLocation.propTypes = {
    url: PropTypes.string,
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

export { Location, LocationProvider, ServerLocation };
export default Location;
