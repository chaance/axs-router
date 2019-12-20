import { isRedirect, redirectTo } from './lib/redirect';
import { match } from './lib/path';
import {
  globalHistory,
  navigate,
  createHistory,
  createMemorySource,
} from './lib/history';
import Location, {
  LocationProvider,
  ServerLocation,
} from './components/Location';
import Router from './components/Router';
import Redirect from './components/Redirect';
import Link from './components/Link';
import Match from './components/Match';

export {
  Link,
  Location,
  LocationProvider,
  Match,
  Redirect,
  Router,
  ServerLocation,
  createHistory,
  createMemorySource,
  isRedirect,
  navigate,
  redirectTo,
  globalHistory,
  match as matchPath,
};
