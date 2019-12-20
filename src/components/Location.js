import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LocationContext } from '../lib/context';
import { globalHistory } from '../lib/history';
import { isRedirect } from '../lib/redirect';
// import { errorBoundary } from '../lib/utils';

// TODO: Test!
////////////////////////////////////////////////////////////////////////////////

// sets up a listener if there isn't one already so apps don't need to be
// wrapped in some top level provider
// eslint-disable-next-line react/prop-types
function Location({ children }) {
  const context = useContext(LocationContext);
  return context ? (
    children(context)
  ) : (
    <LocationProvider>{children}</LocationProvider>
  );
}

////////////////////////////////////////////////////////////////////////////////

// Prop types assigned to LocationProvider
// eslint-disable-next-line react/prop-types
class LocationProvider extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    history: globalHistory,
  };

  state = {
    context: this.getContext(),
    refs: { unlisten: null },
  };

  getContext() {
    let {
      props: {
        history: { navigate, location },
      },
    } = this;
    return { navigate, location };
  }

  componentDidCatch(error, info) {
    if (isRedirect(error)) {
      let {
        props: {
          history: { navigate },
        },
      } = this;
      navigate(error.uri, { replace: true });
    } else {
      throw error;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.context.location !== this.state.context.location) {
      this.props.history._onTransitionComplete();
    }
  }

  componentDidMount() {
    let {
      state: { refs },
      props: { history },
    } = this;
    history._onTransitionComplete();
    refs.unlisten = history.listen(() => {
      Promise.resolve().then(() => {
        // TODO: replace rAF with react deferred update API when it's ready https://github.com/facebook/react/issues/13306
        requestAnimationFrame(() => {
          if (!this.unmounted) {
            this.setState(() => ({ context: this.getContext() }));
          }
        });
      });
    });
  }

  componentWillUnmount() {
    let {
      state: { refs },
    } = this;
    this.unmounted = true;
    refs.unlisten();
  }

  render() {
    let {
      state: { context },
      props: { children },
    } = this;
    return (
      <LocationContext.Provider value={context}>
        {typeof children === 'function' ? children(context) : children || null}
      </LocationContext.Provider>
    );
  }
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
