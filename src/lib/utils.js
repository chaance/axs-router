import React, { Component } from 'react';
import invariant from 'invariant';
import {
  DYNAMIC_POINTS,
  PARAM_REGEX,
  RESERVED_NAMES,
  ROOT_POINTS,
  SEGMENT_POINTS,
  SPLAT_PENALTY,
  STATIC_POINTS,
} from './constants';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

function errorBoundary(Element, callback) {
  return class ErrorBoundary extends Component {
    componentDidCatch(error, info) {
      callback(error, info);
    }

    render() {
      return typeof Element === 'function' ? <Element /> : Element;
    }
  };
}

function isDynamic(segment) {
  return PARAM_REGEX.test(segment);
}

function isRootSegment(segment) {
  return segment === '';
}

function isSplat(segment) {
  return segment && segment[0] === '*';
}

function noop() {}

////////////////////////////////////////////////////////////////////////////////
// pick(routes, uri)
//
// Ranks and picks the best route to match. Each segment gets the highest
// amount of points, then the type of segment gets an additional amount of
// points where
//
//     static > dynamic > splat > root
//
// This way we don't have to worry about the order of our routes, let the
// computers do it.
//
// A route looks like this
//
//     { path, default, value }
//
// And a returned match looks like:
//
//     { route, params, uri }
//
// I know, I should use TypeScript not comments for these types.
function pick(routes, uri) {
  let match;
  let default_;

  let [uriPathname] = uri.split('?');
  let uriSegments = segmentize(uriPathname);
  let isRootUri = uriSegments[0] === '';
  let ranked = rankRoutes(routes);

  for (let i = 0, l = ranked.length; i < l; i++) {
    let missed = false;
    let route = ranked[i].route;

    if (route.default) {
      default_ = {
        route,
        params: {},
        uri,
      };
      continue;
    }

    let routeSegments = segmentize(route.path);
    let params = {};
    let max = Math.max(uriSegments.length, routeSegments.length);
    let index = 0;

    for (; index < max; index++) {
      let routeSegment = routeSegments[index];
      let uriSegment = uriSegments[index];

      if (isSplat(routeSegment)) {
        // Hit a splat, just grab the rest, and return a match
        // uri:   /files/documents/work
        // route: /files/*
        const param = routeSegment.slice(1) || '*';
        params[param] = uriSegments
          .slice(index)
          .map(decodeURIComponent)
          .join('/');
        break;
      }

      if (uriSegment === undefined) {
        // URI is shorter than the route, no match
        // uri:   /users
        // route: /users/:userId
        missed = true;
        break;
      }

      let dynamicMatch = PARAM_REGEX.exec(routeSegment);

      if (dynamicMatch && !isRootUri) {
        let matchIsNotReserved = RESERVED_NAMES.indexOf(dynamicMatch[1]) === -1;
        invariant(
          matchIsNotReserved,
          `<Router> dynamic segment "${dynamicMatch[1]}" is a reserved name. Please use a different name in path "${route.path}".`
        );
        let value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        // Current segments don't match, not dynamic, not splat, so no match
        // uri:   /users/123/settings
        // route: /users/:id/profile
        missed = true;
        break;
      }
    }

    if (!missed) {
      match = {
        route,
        params,
        uri: '/' + uriSegments.slice(0, index).join('/'),
      };
      break;
    }
  }

  return match || default_ || null;
}

function rankRoute(route, index) {
  let score = route.default
    ? 0
    : segmentize(route.path).reduce((score, segment) => {
        score += SEGMENT_POINTS;
        if (isRootSegment(segment)) score += ROOT_POINTS;
        else if (isDynamic(segment)) score += DYNAMIC_POINTS;
        else if (isSplat(segment)) score -= SEGMENT_POINTS + SPLAT_PENALTY;
        else score += STATIC_POINTS;
        return score;
      }, 0);
  return { route, score, index };
}

function rankRoutes(routes) {
  return routes
    .map(rankRoute)
    .sort((a, b) =>
      a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
    );
}

function segmentize(uri) {
  return (
    uri
      // strip starting/ending slashes
      .replace(/(^\/+|\/+$)/g, '')
      .split('/')
  );
}

/**
 * Shallow compares two objects.
 * @param {Object} obj1 The first object to compare.
 * @param {Object} obj2 The second object to compare.
 */
function shallowCompare(obj1, obj2) {
  const obj1Keys = Object.keys(obj1);
  return (
    obj1Keys.length === Object.keys(obj2).length &&
    obj1Keys.every(key => obj2.hasOwnProperty(key) && obj1[key] === obj2[key])
  );
}

function shouldNavigate(event) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
  );
}

function startsWith(string, search) {
  return string.substr(0, search.length) === search;
}

function stripSlashes(str) {
  return str.replace(/(^\/+|\/+$)/g, '');
}

////////////////////////////////////////////////////////////////////////////////
export {
  canUseDOM,
  errorBoundary,
  isDynamic,
  noop,
  pick,
  segmentize,
  shallowCompare,
  shouldNavigate,
  startsWith,
  stripSlashes,
};
