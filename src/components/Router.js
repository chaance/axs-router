import React, { Children, cloneElement, memo, useContext } from 'react';
import invariant from 'invariant';
import FocusHandler from './FocusHandler';
import Location from './Location';
import Redirect from './Redirect';
import { BaseContext } from '../lib/context';
import { pick, stripSlashes } from '../lib/utils';
import { resolve } from '../lib/path';
import { validateRedirect } from '../lib/redirect';

function Router(props) {
  const baseContext = useContext(BaseContext);
  return (
    <Location>
      {locationContext => (
        <RouterImpl {...baseContext} {...locationContext} {...props} />
      )}
    </Location>
  );
}

const RouterImpl = memo(function RouterImpl({
  primary = true,
  location,
  navigate,
  basepath,
  children,
  baseuri,
  component = 'div',
  ...domProps
}) {
  const { pathname } = location;
  const routes = Children.toArray(children).reduce((array, child) => {
    const routes = createRoute(basepath)(child);
    return array.concat(routes);
  }, []);
  const match = pick(routes, pathname);

  if (match) {
    let {
      params,
      uri,
      route,
      route: { value: element },
    } = match;

    // remove the /* from the end for child routes relative paths
    basepath = route.default ? basepath : route.path.replace(/\*$/, '');

    let props = {
      ...params,
      uri,
      location,
      navigate: (to, options) => navigate(resolve(to, uri), options),
    };

    let clone = cloneElement(
      element,
      props,
      element.props.children ? (
        <Router location={location} primary={primary}>
          {element.props.children}
        </Router>
      ) : (
        undefined
      )
    );

    // using 'div' for < 16.3 support
    let FocusWrapper = primary ? FocusHandler : component;
    // don't pass any props to 'div'
    let wrapperProps = primary
      ? { uri, location, component, ...domProps }
      : domProps;

    return (
      <BaseContext.Provider value={{ baseuri: uri, basepath }}>
        <FocusWrapper {...wrapperProps}>{clone}</FocusWrapper>
      </BaseContext.Provider>
    );
  } else {
    // Not sure if we want this, would require index routes at every level
    // warning(
    //   false,
    //   `<Router basepath="${basepath}">\n\nNothing matched:\n\t${
    //     location.pathname
    //   }\n\nPaths checked: \n\t${routes
    //     .map(route => route.path)
    //     .join(
    //       "\n\t"
    //     )}\n\nTo get rid of this warning, add a default NotFound component as child of Router:
    //   \n\tlet NotFound = () => <div>Not Found!</div>
    //   \n\t<Router>\n\t  <NotFound default/>\n\t  {/* ... */}\n\t</Router>`
    // );
    return null;
  }
});

function createRoute(basepath) {
  return function(element) {
    if (!element) {
      return null;
    }

    if (element.type === React.Fragment && element.props.children) {
      return React.Children.map(element.props.children, createRoute(basepath));
    }
    invariant(
      element.props.path || element.props.default || element.type === Redirect,
      `<Router>: Children of <Router> must have a \`path\` or \`default\` prop, or be a \`<Redirect>\`. None found on element type \`${element.type}\``
    );

    invariant(
      !(
        element.type === Redirect &&
        (!element.props.from || !element.props.to)
      ),
      `<Redirect from="${element.props.from}" to="${element.props.to}"/> requires both "from" and "to" props when inside a <Router>.`
    );

    invariant(
      !(
        element.type === Redirect &&
        !validateRedirect(element.props.from, element.props.to)
      ),
      `<Redirect from="${element.props.from} to="${element.props.to}"/> has mismatched dynamic segments, ensure both paths have the exact same dynamic segments.`
    );

    if (element.props.default) {
      return { value: element, default: true };
    }

    let elementPath =
      element.type === Redirect ? element.props.from : element.props.path;

    let path =
      elementPath === '/'
        ? basepath
        : `${stripSlashes(basepath)}/${stripSlashes(elementPath)}`;

    return {
      value: element,
      default: element.props.default,
      path: element.props.children ? `${stripSlashes(path)}/*` : path,
    };
  };
}

export default Router;
