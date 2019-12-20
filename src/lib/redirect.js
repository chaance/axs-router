import { isDynamic, segmentize } from './utils';

function isRedirect(o) {
  return o instanceof RedirectRequest;
}

function RedirectRequest(uri) {
  this.uri = uri;
}

function redirectTo(to) {
  throw new RedirectRequest(to);
}

function validateRedirect(from, to) {
  let filter = segment => isDynamic(segment);
  let fromString = segmentize(from)
    .filter(filter)
    .sort()
    .join('/');
  let toString = segmentize(to)
    .filter(filter)
    .sort()
    .join('/');
  return fromString === toString;
}

export { isRedirect, RedirectRequest, redirectTo, validateRedirect };
