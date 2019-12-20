import { pick, segmentize, startsWith } from './utils';
import { PARAM_REGEX } from './constants';

function addQuery(pathname, query) {
  return pathname + (query ? `?${query}` : '');
}

////////////////////////////////////////////////////////////////////////////////
// insertParams(path, params)
function insertParams(path, params) {
  let segments = segmentize(path);
  return (
    '/' +
    segments
      .map(segment => {
        let match = PARAM_REGEX.exec(segment);
        return match ? params[match[1]] : segment;
      })
      .join('/')
  );
}

////////////////////////////////////////////////////////////////////////////////
// match(path, uri) - Matches just one path to a uri, also lol
function match(path, uri) {
  return pick([{ path }], uri);
}

////////////////////////////////////////////////////////////////////////////////
// resolve(to, basepath)
//
// Resolves URIs as though every path is a directory, no files.  Relative URIs
// in the browser can feel awkward because not only can you be "in a directory"
// you can be "at a file", too. For example
//
//     browserSpecResolve('foo', '/bar/') => /bar/foo
//     browserSpecResolve('foo', '/bar') => /foo
//
// But on the command line of a file system, it's not as complicated, you can't
// `cd` from a file, only directories.  This way, links have to know less about
// their current path. To go deeper you can do this:
//
//     <Link to="deeper"/>
//     // instead of
//     <Link to=`{${props.uri}/deeper}`/>
//
// Just like `cd`, if you want to go deeper from the command line, you do this:
//
//     cd deeper
//     # not
//     cd $(pwd)/deeper
//
// By treating every path as a directory, linking to relative paths should
// require less contextual information and (fingers crossed) be more intuitive.
function resolve(to, base) {
  // /foo/bar, /baz/qux => /foo/bar
  if (startsWith(to, '/')) {
    return to;
  }

  let [toPathname, toQuery] = to.split('?');
  let [basePathname] = base.split('?');

  let toSegments = segmentize(toPathname);
  let baseSegments = segmentize(basePathname);

  // ?a=b, /users?b=c => /users?a=b
  if (toSegments[0] === '') {
    return addQuery(basePathname, toQuery);
  }

  // profile, /users/789 => /users/789/profile
  if (!startsWith(toSegments[0], '.')) {
    let pathname = baseSegments.concat(toSegments).join('/');
    return addQuery((basePathname === '/' ? '' : '/') + pathname, toQuery);
  }

  // ./         /users/123  =>  /users/123
  // ../        /users/123  =>  /users
  // ../..      /users/123  =>  /
  // ../../one  /a/b/c/d    =>  /a/b/one
  // .././one   /a/b/c/d    =>  /a/b/c/one
  let allSegments = baseSegments.concat(toSegments);
  let segments = [];
  for (let i = 0, l = allSegments.length; i < l; i++) {
    let segment = allSegments[i];
    if (segment === '..') segments.pop();
    else if (segment !== '.') segments.push(segment);
  }

  return addQuery('/' + segments.join('/'), toQuery);
}

export { addQuery, insertParams, match, resolve };
