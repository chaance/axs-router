import { pick, shallowCompare } from './utils';
import { match } from './path';

let routes = shuffle([
  {
    value: 'MainGroupMe',
    path: '/groups/main/users/me',
  },
  {
    value: 'GroupMe',
    path: '/groups/:groupId/users/me',
  },
  {
    value: 'GroupUser',
    path: '/groups/:groupId/users/:userId',
  },
  {
    value: 'Fiver',
    path: '/:one/:two/:three/:four/:five',
  },
  {
    value: 'GroupUsersSplat',
    path: '/groups/:groupId/users/*',
  },
  {
    value: 'MainGroupUsers',
    path: '/groups/main/users',
  },
  {
    value: 'GroupUsers',
    path: '/groups/:groupId/users',
  },
  {
    value: 'MainGroup',
    path: '/groups/main',
  },
  {
    value: 'Group',
    path: '/groups/:groupId',
  },
  {
    value: 'Groups',
    path: '/groups',
  },
  {
    value: 'FilesDeep',
    path: '/files/*',
  },
  {
    value: 'Files',
    path: '/files',
  },
  {
    value: 'Root',
    path: '/',
  },
  {
    value: 'Default',
    default: true,
  },
]);

describe('pick', () => {
  test('pick root or dynamic', () => {
    let routes = [
      { value: 'root', path: '/' },
      { value: 'dynamic', path: ':foo' },
    ];
    expect(pick(routes, '/').route.value).toBe('root');
  });

  test('a bunch of scenarios', () => {
    expect(pick(routes, '/').route.value).toBe('Root');
    expect(pick(routes, '/groups/main/users/me').route.value).toBe(
      'MainGroupMe'
    );
    expect(pick(routes, '/groups/123/users/456').route.value).toBe('GroupUser');
    expect(pick(routes, '/one/two/three/four/five').route.value).toBe('Fiver');
    expect(pick(routes, '/groups/main/users').route.value).toBe(
      'MainGroupUsers'
    );
    expect(pick(routes, '/groups/123/users').route.value).toBe('GroupUsers');
    expect(pick(routes, '/groups/main').route.value).toBe('MainGroup');
    expect(pick(routes, '/groups/123').route.value).toBe('Group');
    expect(pick(routes, '/groups').route.value).toBe('Groups');
    expect(pick(routes, '/files/some/long/path').route.value).toBe('FilesDeep');
    expect(pick(routes, '/files').route.value).toBe('Files');
    expect(pick(routes, '/no/where').route.value).toBe('Default');
  });

  test('pick /*', () => {
    expect(match('/*', '/whatever/else')).toMatchSnapshot();
  });

  test('pick return value', () => {
    expect(pick(routes, '/one/two/three/four/five')).toMatchSnapshot();
  });

  test('splat return value', () => {
    expect(pick(routes, '/files/some/deep/path')).toMatchSnapshot();
  });

  test('dynamic segments + splat return value', () => {
    let routes = [{ path: '/users/:userId/files/*' }];
    expect(pick(routes, '/users/ryan/files/some/deep/path')).toMatchSnapshot();
  });

  test('query strings', () => {
    let routes = [{ path: '/users/:userId' }];
    expect(pick(routes, '/users/ryan?cool=stuff')).toMatchSnapshot();
  });
});

describe('shallowCompare', () => {
  test('objects are the same', () => {
    expect(shallowCompare({}, {})).toBeTruthy();
    expect(shallowCompare({ test: 1 }, { test: 1 })).toBeTruthy();
  });
  test('objects are different', () => {
    expect(shallowCompare({ a: undefined }, { b: undefined })).toBeFalsy();
    expect(shallowCompare({}, { b: undefined })).toBeFalsy();
    expect(shallowCompare({ test: 1 }, { test: 2 })).toBeFalsy();
  });
});

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
