import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import ReactTestRenderer from 'react-test-renderer';
import ReactDOMServer from 'react-dom/server';
import {
  createHistory,
  createMemorySource,
  Router,
  LocationProvider,
  Link,
  Match,
  Redirect,
  isRedirect,
  ServerLocation,
} from './index';

describe('smoke tests', () => {
  it(`renders the root component at "/"`, () => {
    snapshot({
      pathname: '/',
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      ),
    });
  });

  it('renders at a path', () => {
    snapshot({
      pathname: '/dash',
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      ),
    });
  });
});

describe('router children', () => {
  it('ignores falsey chidlren', () => {
    snapshot({
      pathname: '/',
      element: (
        <Router>
          <Home path="/" />
          {null}
        </Router>
      ),
    });
  });

  it('allows for fragments', () => {
    snapshot({
      pathname: '/report',
      element: (
        <Router>
          <Home path="/" />
          <Fragment>
            <Dash path="/dash" />
            <AnnualReport path="/report" />
          </Fragment>
        </Router>
      ),
    });
  });
});

describe('passed props', () => {
  it('parses dynamic segments and passes to components', () => {
    snapshot({
      pathname: '/group/123',
      element: (
        <Router>
          <Home path="/" />
          <Group path="/group/:groupId" />
        </Router>
      ),
    });
  });

  it('passes the matched URI to the component', () => {
    snapshot({
      pathname: '/groups/123/users/456',
      element: (
        <Router>
          <PropsPrinter path="/groups/:groupId/users/:userId" />
        </Router>
      ),
    });
  });

  it('shadows params in nested paths', () => {
    snapshot({
      pathname: `/groups/burger/groups/milkshake`,
      element: (
        <Router>
          <Group path="groups/:groupId">
            <Group path="groups/:groupId" />
          </Group>
        </Router>
      ),
    });
  });

  it('parses multiple params when nested', () => {
    snapshot({
      pathname: `/group/123/user/456`,
      element: (
        <Router>
          <Group path="group/:groupId">
            <User path="user/:userId" />
          </Group>
        </Router>
      ),
    });

    function Group({ groupId, children }) {
      return (
        <div>
          {groupId}
          {children}
        </div>
      );
    }

    function User({ userId, groupId }) {
      return (
        <div>
          {groupId} - {userId}
        </div>
      );
    }
  });

  it('router location prop to nested path', () => {
    const pathname = '/reports/1';
    const history = createHistory(createMemorySource(pathname));
    const location = history.location;

    snapshot({
      pathname: '/',
      element: (
        <Router location={location}>
          <Dash path="/">
            <Dash path="/" />
            <Reports path="reports/:reportId" />
          </Dash>
        </Router>
      ),
    });
  });
});

describe('route ranking', () => {
  const Groups = () => <div>Groups</div>;
  const Group = ({ groupId }) => <div>Group Id: {groupId}</div>;
  const MyGroup = () => <div>MyGroup</div>;
  const MyGroupsUsers = () => <div>MyGroupUsers</div>;
  const Users = () => <div>Users</div>;
  const UsersSplat = ({ splat }) => <div>Users Splat: {splat}</div>;
  const User = ({ userId, groupId }) => (
    <div>
      User id: {userId}, Group Id: {groupId}
    </div>
  );
  const Me = () => <div>Me!</div>;
  const MyGroupsAndMe = () => <div>Mine and Me!</div>;
  const Fiver = ({ one, two, three, four, five }) => (
    <div>
      Fiver {one} {two} {three} {four} {five}
    </div>
  );

  const element = (
    <Router>
      <Root path="/" />
      <Groups path="/groups" />
      <Group path="/groups/:groupId" />
      <MyGroup path="/groups/mine" />
      <Users path="/groups/:groupId/users" />
      <MyGroupsUsers path="/groups/mine/users" />
      <UsersSplat path="/groups/:groupId/users/*" />
      <User path="/groups/:groupId/users/:userId" />
      <Me path="/groups/:groupId/users/me" />
      <MyGroupsAndMe path="/groups/mine/users/me" />
      <Fiver path="/:one/:two/:three/:four/:five" />
    </Router>
  );

  test('/', () => {
    snapshot({ element, pathname: '/' }); // Root
  });
  test('/groups', () => {
    snapshot({ element, pathname: '/groups' }); // Groups
  });
  test('/groups/123', () => {
    snapshot({ element, pathname: '/groups/123' }); // Group
  });
  test('/groups/mine', () => {
    snapshot({ element, pathname: '/groups/mine' }); // MyGroup
  });

  test('/groups/123/users', () => {
    snapshot({ element, pathname: '/groups/123/users' }); // Users
  });

  test('/groups/mine/users', () => {
    snapshot({ element, pathname: '/groups/mine/users' }); // MyGroupsUsers
  });

  test('/groups/123/users/456', () => {
    snapshot({ element, pathname: '/groups/123/users/456' }); // User
  });

  test('/groups/123/users/me', () => {
    snapshot({ element, pathname: '/groups/123/users/me' }); // Me
  });

  test('/groups/123/users/a/bunch/of/junk', () => {
    snapshot({
      element,
      pathname: '/groups/123/users/a/bunch/of/junk',
    }); // UsersSplat
  });

  test('/groups/mine/users/me', () => {
    snapshot({ element, pathname: '/groups/mine/users/me' }); // MyGroupsAndMe
  });

  test('/one/two/three/four/five', () => {
    snapshot({ element, pathname: '/one/two/three/four/five' }); // Fiver
  });
});

describe('nested rendering', () => {
  it('renders a nested path', () => {
    snapshot({
      pathname: '/dash/reports',
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports" />
          </Dash>
        </Router>
      ),
    });
  });

  it('renders a really nested path', () => {
    snapshot({
      pathname: '/dash/reports/annual',
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      ),
    });
  });

  it('renders at a path with nested paths', () => {
    snapshot({
      pathname: '/dash',
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      ),
    });
  });

  it("renders a child 'index' nested path", () => {
    snapshot({
      pathname: '/dash',
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="/" />
          </Dash>
        </Router>
      ),
    });
  });

  it('yo dawg', () => {
    snapshot({
      pathname: '/',
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/" />
              <Reports path=":reportId" />
            </Dash>
          </Dash>
        </Router>
      ),
    });
  });

  it('yo dawg again', () => {
    snapshot({
      pathname: '/',
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/" />
              <Reports path="reports/:reportId" />
            </Dash>
          </Dash>
        </Router>
      ),
    });
  });

  it('matches multiple nested / down to a child with a path', () => {
    snapshot({
      pathname: '/yo',
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/yo" />
            </Dash>
          </Dash>
        </Router>
      ),
    });
  });
});

describe('disrespect', () => {
  it('has complete disrespect for leading and trailing slashes', () => {
    snapshot({
      pathname: 'dash/reports/annual/',
      element: (
        <Router>
          <Home path="/" />
          <Dash path="dash">
            <Reports path="/reports/">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      ),
    });
  });
});

describe('links', () => {
  it('accepts an innerRef prop', () => {
    let ref;
    let div = document.createElement('div');
    ReactTestUtils.act(() => {
      ReactDOM.render(<Link to="/" innerRef={node => (ref = node)} />, div);
    });
    expect(ref).toBeInstanceOf(HTMLAnchorElement);
    ReactTestUtils.act(() => void ReactDOM.unmountComponentAtNode(div));
  });

  it('forwards refs', () => {
    let ref;
    let div = document.createElement('div');
    ReactTestUtils.act(() => {
      ReactDOM.render(<Link to="/" ref={node => (ref = node)} />, div);
    });
    expect(ref).toBeInstanceOf(HTMLAnchorElement);
    ReactTestUtils.act(() => void ReactDOM.unmountComponentAtNode(div));
  });

  it('renders links with relative hrefs', () => {
    snapshot({
      pathname: '/dash/reports',
      element: (
        <Router>
          <Parent path="dash">
            <Child path="reports" />
            <Child path="charts" />
          </Parent>
        </Router>
      ),
    });

    function Parent({ children }) {
      return (
        <div>
          <h1>Parent</h1>
          <Link to="reports">/dash/reports</Link>
          {children}
        </div>
      );
    }

    function Child() {
      return (
        <div>
          <h2>Child</h2>
          <Link to="../">/dash</Link>
        </div>
      );
    }
  });

  it('uses the right href in multiple root paths', () => {
    snapshot({
      pathname: '/one/two',
      element: (
        <Router>
          <Parent path="/">
            <Parent path="/">
              <Parent path="one">
                <Child path="two" />
              </Parent>
            </Parent>
          </Parent>
        </Router>
      ),
    });

    function Parent({ uri, children }) {
      return (
        <div>
          <div>Parent URI: {uri}</div>
          {children}
        </div>
      );
    }

    function Child({ uri }) {
      return (
        <div>
          <div>Child URI: {uri}</div>
          <Link to="three">/one/two/three</Link>
          <Link to="..">/one</Link>
          <Link to="../..">/</Link>
        </div>
      );
    }
  });

  it('calls history.pushState when clicked', () => {
    const testSource = createMemorySource('/');
    testSource.history.replaceState = jest.fn();
    testSource.history.pushState = jest.fn();
    const testHistory = createHistory(testSource);
    const div = document.createElement('div');

    ReactTestUtils.act(() => {
      ReactDOM.render(
        <LocationProvider history={testHistory}>
          <Router>
            <SomePage path="/" />
            <Reports path="/reports" />
          </Router>
        </LocationProvider>,
        div
      );
    });
    try {
      const a = div.querySelector('a');
      ReactTestUtils.act(
        () => void ReactTestUtils.Simulate.click(a, { button: 0 })
      );
      expect(testSource.history.pushState).toHaveBeenCalled();
    } finally {
      ReactTestUtils.act(() => void ReactDOM.unmountComponentAtNode(div));
    }

    function SomePage() {
      return <Link to="/reports">Go To Reports</Link>;
    }
  });

  it('calls history.pushState when clicked -- even if navigated before', () => {
    const testSource = createMemorySource('/#payload=...');
    const { history } = testSource;
    history.replaceState = jest.fn(history.replaceState.bind(history));
    history.pushState = jest.fn(history.pushState.bind(history));
    const testHistory = createHistory(testSource);

    // ReactTestUtils.Simulate that payload in URL hash is being hidden
    // before React renders anything ...
    testHistory.navigate('/', { replace: true });
    expect(testSource.history.replaceState).toHaveBeenCalled();

    const div = document.createElement('div');
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <LocationProvider history={testHistory}>
          <Router>
            <SomePage path="/" />
            <Reports path="/reports" />
          </Router>
        </LocationProvider>,
        div
      );
    });
    try {
      const a = div.querySelector('a');
      ReactTestUtils.act(
        () => void ReactTestUtils.Simulate.click(a, { button: 0 })
      );
      expect(testSource.history.pushState).toHaveBeenCalled();
    } finally {
      ReactTestUtils.act(() => void ReactDOM.unmountComponentAtNode(div));
    }

    function SomePage() {
      return <Link to="/reports">Go To Reports</Link>;
    }
  });

  it('calls history.replaceState when link for current path is clicked without state', () => {
    const testSource = createMemorySource('/test');
    testSource.history.replaceState = jest.fn();
    const testHistory = createHistory(testSource);
    const TestPage = () => <Link to="/test">Go To Test</Link>;
    const div = document.createElement('div');
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <LocationProvider history={testHistory}>
          <Router>
            <TestPage path="/test" />
          </Router>
        </LocationProvider>,
        div
      );
    });
    try {
      const a = div.querySelector('a');
      ReactTestUtils.act(
        () => void ReactTestUtils.Simulate.click(a, { button: 0 })
      );
      expect(testSource.history.replaceState).toHaveBeenCalledTimes(1);
    } finally {
      ReactTestUtils.act(() => void ReactDOM.unmountComponentAtNode(div));
    }
  });
  it('calls history.replaceState when link for current path is clicked with the same state', () => {
    const testSource = createMemorySource('/test');
    testSource.history.replaceState = jest.fn();
    const testHistory = createHistory(testSource);
    testHistory.navigate('/test', { state: { id: '123' } });
    const TestPage = () => (
      <Link to="/test" state={{ id: '123' }}>
        Go To Test
      </Link>
    );
    const div = document.createElement('div');
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <LocationProvider history={testHistory}>
          <Router>
            <TestPage path="/test" />
          </Router>
        </LocationProvider>,
        div
      );
    });
    try {
      const a = div.querySelector('a');
      ReactTestUtils.act(
        () => void ReactTestUtils.Simulate.click(a, { button: 0 })
      );
      expect(testSource.history.replaceState).toHaveBeenCalledTimes(1);
    } finally {
      ReactTestUtils.act(() => void ReactDOM.unmountComponentAtNode(div));
    }
  });
  it('calls history.pushState when link for current path is clicked with different state', async () => {
    const testSource = createMemorySource('/test');
    testSource.history.pushState = jest.fn(testSource.history.pushState);
    const testHistory = createHistory(testSource);
    const TestPage = () => (
      <Link to="/test" state={{ id: 1 }}>
        Go To Test
      </Link>
    );
    const div = document.createElement('div');
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <LocationProvider history={testHistory}>
          <Router>
            <TestPage path="/test" />
          </Router>
        </LocationProvider>,
        div
      );
    });
    try {
      const a = div.querySelector('a');
      ReactTestUtils.act(
        () => void ReactTestUtils.Simulate.click(a, { button: 0 })
      );
      await ReactTestUtils.act(async () => {
        await testHistory.navigate('/test', { state: { id: 2 } });
      });
      ReactTestUtils.act(
        () => void ReactTestUtils.Simulate.click(a, { button: 0 })
      );
      expect(testSource.history.pushState).toHaveBeenCalledTimes(2);
    } finally {
      ReactTestUtils.act(() => void ReactDOM.unmountComponentAtNode(div));
    }
  });
});

describe('transitions', () => {
  it('transitions pages', async () => {
    let wrapper;
    let history = createHistory(createMemorySource('/'));
    ReactTestRenderer.act(() => {
      wrapper = ReactTestRenderer.create(
        <LocationProvider history={history}>
          <Router>
            <Home path="/" />
            <Reports path="reports" />
          </Router>
        </LocationProvider>
      );
    });
    expect(wrapper.toJSON()).toMatchSnapshot();
    await ReactTestRenderer.act(async () => {
      await history.navigate('/reports');
    });
    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('keeps the stack right on interrupted transitions', async () => {
    let wrapper;
    let history = createHistory(createMemorySource('/'));
    ReactTestRenderer.act(() => {
      wrapper = ReactTestRenderer.create(
        <LocationProvider history={history}>
          <Router>
            <Home path="/" />
            <Reports path="reports" />
            <AnnualReport path="annual-report" />
          </Router>
        </LocationProvider>
      );
    });
    ReactTestRenderer.act(() => void history.navigate('/reports'));
    await ReactTestRenderer.act(async () => {
      await history.navigate('/annual-report');
    });
    expect(wrapper.toJSON()).toMatchSnapshot();
    expect(history.index === 1);
  });
});

describe('relative navigate prop', () => {
  it('navigates relative', async () => {
    let relativeNavigate;

    const User = ({ children, navigate, userId }) => {
      relativeNavigate = navigate;
      return (
        <div>
          User:
          {userId}
          {children}
        </div>
      );
    };

    const Settings = () => <div>Settings</div>;

    let wrapper;
    let history = createHistory(createMemorySource('/user/123'));
    ReactTestRenderer.act(() => {
      wrapper = ReactTestRenderer.create(
        <LocationProvider history={history}>
          <Router>
            <User path="user/:userId">
              <Settings path="settings" />
            </User>
          </Router>
        </LocationProvider>
      );
    });
    expect(wrapper.toJSON()).toMatchSnapshot();
    await ReactTestRenderer.act(async () => {
      await relativeNavigate('settings');
    });
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});

describe('nested routers', () => {
  it('allows arbitrary Router nesting through context', () => {
    snapshot({
      pathname: `/chat/home`,
      element: (
        <Router>
          <PageWithNestedApp path="/chat/*" />
        </Router>
      ),
    });
  });
});

describe('Match', () => {
  it('matches a path', () => {
    snapshot({
      pathname: `/groups/123`,
      element: (
        <Match path="/groups/:groupId">
          {props => <PropsPrinter {...props} />}
        </Match>
      ),
    });
  });
});

describe('location', () => {
  it('correctly parses pathname, search and hash fields', () => {
    let wrapper;
    let testHistory = createHistory(
      createMemorySource('/print-location?it=works&with=queries')
    );
    ReactTestRenderer.act(() => {
      wrapper = ReactTestRenderer.create(
        <LocationProvider history={testHistory}>
          <Router>
            <PrintLocation path="/print-location" />
          </Router>
        </LocationProvider>
      );
    });
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});

// React 16.4 is buggy https://github.com/facebook/react/issues/12968
// so some tests are skipped
describe('ServerLocation', () => {
  it('works', () => {
    expect(
      ReactDOMServer.renderToString(
        <ServerLocation url="/">
          <AppWithNestedRouter />
        </ServerLocation>
      )
    ).toMatchSnapshot();

    expect(
      ReactDOMServer.renderToString(
        <ServerLocation url="/groups/123">
          <AppWithNestedRouter />
        </ServerLocation>
      )
    ).toMatchSnapshot();
  });

  it('redirects', () => {
    let redirectedPath = '/g/123';
    let markup;
    try {
      markup = ReactDOMServer.renderToString(
        <ServerLocation url={redirectedPath}>
          <AppWithNestedRouter />
        </ServerLocation>
      );
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error.uri).toBe('/groups/123');
    }
    expect(markup).not.toBeDefined();
  });

  it('nested redirects', () => {
    let redirectedPath = '/nested';
    let markup;
    try {
      markup = ReactDOMServer.renderToString(
        <ServerLocation url={redirectedPath}>
          <AppWithNestedRouter />
        </ServerLocation>
      );
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error.uri).toBe('/nested/home');
    }
    expect(markup).not.toBeDefined();
  });

  it('location.search', () => {
    let markup = ReactDOMServer.renderToStaticMarkup(
      <ServerLocation url="/print-location?it=works">
        <AppWithNestedRouter />
      </ServerLocation>
    );
    expect(markup).toContain('location.pathname: [/print-location]');
    expect(markup).toContain('location.search: [?it=works]');
  });
});

describe('trailing wildcard', () => {
  it('passes down wildcard name to the component as prop', () => {
    const FileBrowser = ({ filePath }) => filePath;

    snapshot({
      pathname: `/files/README.md`,
      element: (
        <Router>
          <FileBrowser path="files/*filePath" />
        </Router>
      ),
    });
  });

  it("passes down '*' as the prop name if not specified", () => {
    const FileBrowser = props => props['*'];

    snapshot({
      pathname: `/files/README.md`,
      element: (
        <Router>
          <FileBrowser path="files/*" />
        </Router>
      ),
    });
  });

  it('passes down to Match as well', () => {
    snapshot({
      pathname: `/somewhere/deep/i/mean/really/deep`,
      element: (
        <Match path="/somewhere/deep/*rest">
          {props => <div>{props.match.rest}</div>}
        </Match>
      ),
    });
  });

  it("passes down to Match as unnamed '*'", () => {
    snapshot({
      pathname: `/somewhere/deep/i/mean/really/deep`,
      element: (
        <Match path="/somewhere/deep/*">
          {props => <div>{props.match['*']}</div>}
        </Match>
      ),
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

function snapshot({ pathname, element }) {
  let wrapper;
  let testHistory = createHistory(createMemorySource(pathname));
  ReactTestRenderer.act(() => {
    wrapper = ReactTestRenderer.create(
      <LocationProvider history={testHistory}>{element}</LocationProvider>
    );
  });
  const tree = wrapper.toJSON();
  expect(tree).toMatchSnapshot();
  return tree;
}

function Home() {
  return <div>Home</div>;
}

function Dash({ children }) {
  return <div>Dash {children}</div>;
}

function Group({ groupId, children }) {
  return (
    <div>
      Group: {groupId}
      {children}
    </div>
  );
}

function PropsPrinter(props) {
  return <pre>{JSON.stringify(props, null, 2)}</pre>;
}

function Reports({ children }) {
  return <div>Reports {children}</div>;
}

function AnnualReport() {
  return <div>Annual Report</div>;
}

function PrintLocation({ location }) {
  return (
    <div>
      <div>location.pathname: [{location.pathname}]</div>
      <div>location.search: [{location.search}]</div>
    </div>
  );
}

function Root() {
  return <div>Root</div>;
}

function ChatHome() {
  return <div>Chat Home</div>;
}

function PageWithNestedApp() {
  return (
    <div>
      Home
      <ChatApp />
    </div>
  );
}

function ChatApp() {
  return (
    <Router>
      <ChatHome path="/home" />
    </Router>
  );
}

function NestedRouter() {
  return (
    <Router>
      <Home path="/home" />
      <Redirect from="/" to="./home" />
    </Router>
  );
}

function AppWithNestedRouter() {
  return (
    <Router>
      <Home path="/" />
      <Group path="/groups/:groupId" />
      <Redirect from="/g/:groupId" to="/groups/:groupId" />
      <NestedRouter path="/nested/*" />
      <PrintLocation path="/print-location" />
    </Router>
  );
}
