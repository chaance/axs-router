"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _testUtils = _interopRequireDefault(require("react-dom/test-utils"));

var _reactTestRenderer = _interopRequireDefault(require("react-test-renderer"));

var _server = require("react-dom/server");

var _index = require("./index");

/* eslint-disable react/prop-types */
var snapshot = function snapshot(_ref) {
  var pathname = _ref.pathname,
      element = _ref.element;
  var testHistory = (0, _index.createHistory)((0, _index.createMemorySource)(pathname));

  var wrapper = _reactTestRenderer["default"].create(_react["default"].createElement(_index.LocationProvider, {
    history: testHistory
  }, element));

  var tree = wrapper.toJSON();
  expect(tree).toMatchSnapshot();
  return tree;
};

var runWithNavigation = function runWithNavigation(element, pathname) {
  if (pathname === void 0) {
    pathname = "/";
  }

  var history = (0, _index.createHistory)((0, _index.createMemorySource)(pathname));

  var wrapper = _reactTestRenderer["default"].create(_react["default"].createElement(_index.LocationProvider, {
    history: history
  }, element));

  var snapshot = function snapshot() {
    expect(wrapper.toJSON()).toMatchSnapshot();
  };

  return {
    history: history,
    snapshot: snapshot,
    wrapper: wrapper
  };
};

var Home = function Home() {
  return _react["default"].createElement("div", null, "Home");
};

var Dash = function Dash(_ref2) {
  var children = _ref2.children;
  return _react["default"].createElement("div", null, "Dash ", children);
};

var Group = function Group(_ref3) {
  var groupId = _ref3.groupId,
      children = _ref3.children;
  return _react["default"].createElement("div", null, "Group: ", groupId, children);
};

var PropsPrinter = function PropsPrinter(props) {
  return _react["default"].createElement("pre", null, JSON.stringify(props, null, 2));
};

var Reports = function Reports(_ref4) {
  var children = _ref4.children;
  return _react["default"].createElement("div", null, "Reports ", children);
};

var AnnualReport = function AnnualReport() {
  return _react["default"].createElement("div", null, "Annual Report");
};

var PrintLocation = function PrintLocation(_ref5) {
  var location = _ref5.location;
  return _react["default"].createElement("div", null, _react["default"].createElement("div", null, "location.pathname: [", location.pathname, "]"), _react["default"].createElement("div", null, "location.search: [", location.search, "]"));
};

describe("smoke tests", function () {
  it("renders the root component at \"/\"", function () {
    snapshot({
      pathname: "/",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Dash, {
        path: "/dash"
      }))
    });
  });
  it("renders at a path", function () {
    snapshot({
      pathname: "/dash",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Dash, {
        path: "/dash"
      }))
    });
  });
});
describe("Router children", function () {
  it("ignores falsey chidlren", function () {
    snapshot({
      pathname: "/",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), null)
    });
  });
  it("allows for fragments", function () {
    snapshot({
      pathname: "/report",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement(Dash, {
        path: "/dash"
      }), _react["default"].createElement(AnnualReport, {
        path: "/report"
      })))
    });
  });
});
describe("passed props", function () {
  it("parses dynamic segments and passes to components", function () {
    snapshot({
      pathname: "/group/123",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Group, {
        path: "/group/:groupId"
      }))
    });
  });
  it("passes the matched URI to the component", function () {
    snapshot({
      pathname: "/groups/123/users/456",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(PropsPrinter, {
        path: "/groups/:groupId/users/:userId"
      }))
    });
  });
  it("shadows params in nested paths", function () {
    snapshot({
      pathname: "/groups/burger/groups/milkshake",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Group, {
        path: "groups/:groupId"
      }, _react["default"].createElement(Group, {
        path: "groups/:groupId"
      })))
    });
  });
  it("parses multiple params when nested", function () {
    var Group = function Group(_ref6) {
      var groupId = _ref6.groupId,
          children = _ref6.children;
      return _react["default"].createElement("div", null, groupId, children);
    };

    var User = function User(_ref7) {
      var userId = _ref7.userId,
          groupId = _ref7.groupId;
      return _react["default"].createElement("div", null, groupId, " - ", userId);
    };

    snapshot({
      pathname: "/group/123/user/456",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Group, {
        path: "group/:groupId"
      }, _react["default"].createElement(User, {
        path: "user/:userId"
      })))
    });
  });
  it("router location prop to nested path", function () {
    var pathname = "/reports/1";
    var history = (0, _index.createHistory)((0, _index.createMemorySource)(pathname));
    var location = history.location;
    snapshot({
      pathname: "/",
      element: _react["default"].createElement(_index.Router, {
        location: location
      }, _react["default"].createElement(Dash, {
        path: "/"
      }, _react["default"].createElement(Dash, {
        path: "/"
      }), _react["default"].createElement(Reports, {
        path: "reports/:reportId"
      })))
    });
  });
});
describe("route ranking", function () {
  var Root = function Root() {
    return _react["default"].createElement("div", null, "Root");
  };

  var Groups = function Groups() {
    return _react["default"].createElement("div", null, "Groups");
  };

  var Group = function Group(_ref8) {
    var groupId = _ref8.groupId;
    return _react["default"].createElement("div", null, "Group Id: ", groupId);
  };

  var MyGroup = function MyGroup() {
    return _react["default"].createElement("div", null, "MyGroup");
  };

  var MyGroupsUsers = function MyGroupsUsers() {
    return _react["default"].createElement("div", null, "MyGroupUsers");
  };

  var Users = function Users() {
    return _react["default"].createElement("div", null, "Users");
  };

  var UsersSplat = function UsersSplat(_ref9) {
    var splat = _ref9.splat;
    return _react["default"].createElement("div", null, "Users Splat: ", splat);
  };

  var User = function User(_ref10) {
    var userId = _ref10.userId,
        groupId = _ref10.groupId;
    return _react["default"].createElement("div", null, "User id: ", userId, ", Group Id: ", groupId);
  };

  var Me = function Me() {
    return _react["default"].createElement("div", null, "Me!");
  };

  var MyGroupsAndMe = function MyGroupsAndMe() {
    return _react["default"].createElement("div", null, "Mine and Me!");
  };

  var Fiver = function Fiver(_ref11) {
    var one = _ref11.one,
        two = _ref11.two,
        three = _ref11.three,
        four = _ref11.four,
        five = _ref11.five;
    return _react["default"].createElement("div", null, "Fiver ", one, " ", two, " ", three, " ", four, " ", five);
  };

  var element = _react["default"].createElement(_index.Router, null, _react["default"].createElement(Root, {
    path: "/"
  }), _react["default"].createElement(Groups, {
    path: "/groups"
  }), _react["default"].createElement(Group, {
    path: "/groups/:groupId"
  }), _react["default"].createElement(MyGroup, {
    path: "/groups/mine"
  }), _react["default"].createElement(Users, {
    path: "/groups/:groupId/users"
  }), _react["default"].createElement(MyGroupsUsers, {
    path: "/groups/mine/users"
  }), _react["default"].createElement(UsersSplat, {
    path: "/groups/:groupId/users/*"
  }), _react["default"].createElement(User, {
    path: "/groups/:groupId/users/:userId"
  }), _react["default"].createElement(Me, {
    path: "/groups/:groupId/users/me"
  }), _react["default"].createElement(MyGroupsAndMe, {
    path: "/groups/mine/users/me"
  }), _react["default"].createElement(Fiver, {
    path: "/:one/:two/:three/:four/:five"
  }));

  test("/", function () {
    snapshot({
      element: element,
      pathname: "/"
    }); // Root
  });
  test("/groups", function () {
    snapshot({
      element: element,
      pathname: "/groups"
    }); // Groups
  });
  test("/groups/123", function () {
    snapshot({
      element: element,
      pathname: "/groups/123"
    }); // Group
  });
  test("/groups/mine", function () {
    snapshot({
      element: element,
      pathname: "/groups/mine"
    }); // MyGroup
  });
  test("/groups/123/users", function () {
    snapshot({
      element: element,
      pathname: "/groups/123/users"
    }); // Users
  });
  test("/groups/mine/users", function () {
    snapshot({
      element: element,
      pathname: "/groups/mine/users"
    }); // MyGroupsUsers
  });
  test("/groups/123/users/456", function () {
    snapshot({
      element: element,
      pathname: "/groups/123/users/456"
    }); // User
  });
  test("/groups/123/users/me", function () {
    snapshot({
      element: element,
      pathname: "/groups/123/users/me"
    }); // Me
  });
  test("/groups/123/users/a/bunch/of/junk", function () {
    snapshot({
      element: element,
      pathname: "/groups/123/users/a/bunch/of/junk"
    }); // UsersSplat
  });
  test("/groups/mine/users/me", function () {
    snapshot({
      element: element,
      pathname: "/groups/mine/users/me"
    }); // MyGroupsAndMe
  });
  test("/one/two/three/four/five", function () {
    snapshot({
      element: element,
      pathname: "/one/two/three/four/five"
    }); // Fiver
  });
});
describe("nested rendering", function () {
  it("renders a nested path", function () {
    snapshot({
      pathname: "/dash/reports",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Dash, {
        path: "/dash"
      }, _react["default"].createElement(Reports, {
        path: "reports"
      })))
    });
  });
  it("renders a really nested path", function () {
    snapshot({
      pathname: "/dash/reports/annual",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Dash, {
        path: "/dash"
      }, _react["default"].createElement(Reports, {
        path: "reports"
      }, _react["default"].createElement(AnnualReport, {
        path: "annual"
      }))))
    });
  });
  it("renders at a path with nested paths", function () {
    snapshot({
      pathname: "/dash",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Dash, {
        path: "/dash"
      }, _react["default"].createElement(Reports, {
        path: "reports"
      }, _react["default"].createElement(AnnualReport, {
        path: "annual"
      }))))
    });
  });
  it("renders a child 'index' nested path", function () {
    snapshot({
      pathname: "/dash",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Dash, {
        path: "/dash"
      }, _react["default"].createElement(Reports, {
        path: "/"
      })))
    });
  });
  it("yo dawg", function () {
    snapshot({
      pathname: "/",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Dash, {
        path: "/"
      }, _react["default"].createElement(Dash, {
        path: "/"
      }, _react["default"].createElement(Dash, {
        path: "/"
      }), _react["default"].createElement(Reports, {
        path: ":reportId"
      }))))
    });
  });
  it("yo dawg again", function () {
    snapshot({
      pathname: "/",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Dash, {
        path: "/"
      }, _react["default"].createElement(Dash, {
        path: "/"
      }, _react["default"].createElement(Dash, {
        path: "/"
      }), _react["default"].createElement(Reports, {
        path: "reports/:reportId"
      }))))
    });
  });
  it("matches multiple nested / down to a child with a path", function () {
    snapshot({
      pathname: "/yo",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Dash, {
        path: "/"
      }, _react["default"].createElement(Dash, {
        path: "/"
      }, _react["default"].createElement(Dash, {
        path: "/yo"
      }))))
    });
  });
});
describe("disrespect", function () {
  it("has complete disrespect for leading and trailing slashes", function () {
    snapshot({
      pathname: "dash/reports/annual/",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
        path: "/"
      }), _react["default"].createElement(Dash, {
        path: "dash"
      }, _react["default"].createElement(Reports, {
        path: "/reports/"
      }, _react["default"].createElement(AnnualReport, {
        path: "annual"
      }))))
    });
  });
});
describe("links", function () {
  it("accepts an innerRef prop", function (done) {
    var ref;
    var div = document.createElement("div");

    _reactDom["default"].render(_react["default"].createElement(_index.Link, {
      to: "/",
      innerRef: function innerRef(node) {
        return ref = node;
      }
    }), div, function () {
      expect(ref).toBeInstanceOf(HTMLAnchorElement);

      _reactDom["default"].unmountComponentAtNode(div);

      done();
    });
  });
  it("forwards refs", function (done) {
    var _ref12;

    var div = document.createElement("div");

    _reactDom["default"].render(_react["default"].createElement(_index.Link, {
      to: "/",
      ref: function ref(node) {
        return _ref12 = node;
      }
    }), div, function () {
      expect(_ref12).toBeInstanceOf(HTMLAnchorElement);

      _reactDom["default"].unmountComponentAtNode(div);

      done();
    });
  });
  it("renders links with relative hrefs", function () {
    var Parent = function Parent(_ref13) {
      var children = _ref13.children;
      return _react["default"].createElement("div", null, _react["default"].createElement("h1", null, "Parent"), _react["default"].createElement(_index.Link, {
        to: "reports"
      }, "/dash/reports"), children);
    };

    var Child = function Child() {
      return _react["default"].createElement("div", null, _react["default"].createElement("h2", null, "Child"), _react["default"].createElement(_index.Link, {
        to: "../"
      }, "/dash"));
    };

    snapshot({
      pathname: "/dash/reports",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Parent, {
        path: "dash"
      }, _react["default"].createElement(Child, {
        path: "reports"
      }), _react["default"].createElement(Child, {
        path: "charts"
      })))
    });
  });
  it("uses the right href in multiple root paths", function () {
    var Parent = function Parent(_ref14) {
      var uri = _ref14.uri,
          children = _ref14.children;
      return _react["default"].createElement("div", null, _react["default"].createElement("div", null, "Parent URI: ", uri), children);
    };

    var Child = function Child(_ref15) {
      var uri = _ref15.uri;
      return _react["default"].createElement("div", null, _react["default"].createElement("div", null, "Child URI: ", uri), _react["default"].createElement(_index.Link, {
        to: "three"
      }, "/one/two/three"), _react["default"].createElement(_index.Link, {
        to: ".."
      }, "/one"), _react["default"].createElement(_index.Link, {
        to: "../.."
      }, "/"));
    };

    snapshot({
      pathname: "/one/two",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(Parent, {
        path: "/"
      }, _react["default"].createElement(Parent, {
        path: "/"
      }, _react["default"].createElement(Parent, {
        path: "one"
      }, _react["default"].createElement(Child, {
        path: "two"
      })))))
    });
  });
  it("calls history.pushState when clicked", function () {
    var testSource = (0, _index.createMemorySource)("/");
    testSource.history.replaceState = jest.fn();
    testSource.history.pushState = jest.fn();
    var testHistory = (0, _index.createHistory)(testSource);

    var SomePage = function SomePage() {
      return _react["default"].createElement(_index.Link, {
        to: "/reports"
      }, "Go To Reports");
    };

    var div = document.createElement("div");

    _reactDom["default"].render(_react["default"].createElement(_index.LocationProvider, {
      history: testHistory
    }, _react["default"].createElement(_index.Router, null, _react["default"].createElement(SomePage, {
      path: "/"
    }), _react["default"].createElement(Reports, {
      path: "/reports"
    }))), div);

    try {
      var a = div.querySelector("a");

      _testUtils["default"].Simulate.click(a, {
        button: 0
      });

      expect(testSource.history.pushState).toHaveBeenCalled();
    } finally {
      _reactDom["default"].unmountComponentAtNode(div);
    }
  });
  it("calls history.pushState when clicked -- even if navigated before", function () {
    var testSource = (0, _index.createMemorySource)("/#payload=...");
    var history = testSource.history;
    history.replaceState = jest.fn(history.replaceState.bind(history));
    history.pushState = jest.fn(history.pushState.bind(history));
    var testHistory = (0, _index.createHistory)(testSource); // Simulate that payload in URL hash is being hidden
    // before React renders anything ...

    testHistory.navigate("/", {
      replace: true
    });
    expect(testSource.history.replaceState).toHaveBeenCalled();

    var SomePage = function SomePage() {
      return _react["default"].createElement(_index.Link, {
        to: "/reports"
      }, "Go To Reports");
    };

    var div = document.createElement("div");

    _reactDom["default"].render(_react["default"].createElement(_index.LocationProvider, {
      history: testHistory
    }, _react["default"].createElement(_index.Router, null, _react["default"].createElement(SomePage, {
      path: "/"
    }), _react["default"].createElement(Reports, {
      path: "/reports"
    }))), div);

    try {
      var a = div.querySelector("a");

      _testUtils["default"].Simulate.click(a, {
        button: 0
      });

      expect(testSource.history.pushState).toHaveBeenCalled();
    } finally {
      _reactDom["default"].unmountComponentAtNode(div);
    }
  });
  it("calls history.replaceState when link for current path is clicked without state", function () {
    var testSource = (0, _index.createMemorySource)("/test");
    testSource.history.replaceState = jest.fn();
    var testHistory = (0, _index.createHistory)(testSource);

    var TestPage = function TestPage() {
      return _react["default"].createElement(_index.Link, {
        to: "/test"
      }, "Go To Test");
    };

    var div = document.createElement("div");

    _reactDom["default"].render(_react["default"].createElement(_index.LocationProvider, {
      history: testHistory
    }, _react["default"].createElement(_index.Router, null, _react["default"].createElement(TestPage, {
      path: "/test"
    }))), div);

    try {
      var a = div.querySelector("a");

      _testUtils["default"].Simulate.click(a, {
        button: 0
      });

      expect(testSource.history.replaceState).toHaveBeenCalledTimes(1);
    } finally {
      _reactDom["default"].unmountComponentAtNode(div);
    }
  });
  it("calls history.replaceState when link for current path is clicked with the same state", function () {
    var testSource = (0, _index.createMemorySource)("/test");
    testSource.history.replaceState = jest.fn();
    var testHistory = (0, _index.createHistory)(testSource);
    testHistory.navigate("/test", {
      state: {
        id: "123"
      }
    });

    var TestPage = function TestPage() {
      return _react["default"].createElement(_index.Link, {
        to: "/test",
        state: {
          id: "123"
        }
      }, "Go To Test");
    };

    var div = document.createElement("div");

    _reactDom["default"].render(_react["default"].createElement(_index.LocationProvider, {
      history: testHistory
    }, _react["default"].createElement(_index.Router, null, _react["default"].createElement(TestPage, {
      path: "/test"
    }))), div);

    try {
      var a = div.querySelector("a");

      _testUtils["default"].Simulate.click(a, {
        button: 0
      });

      expect(testSource.history.replaceState).toHaveBeenCalledTimes(1);
    } finally {
      _reactDom["default"].unmountComponentAtNode(div);
    }
  });
  it("calls history.pushState when link for current path is clicked with different state",
  /*#__PURE__*/
  (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    var testSource, testHistory, TestPage, div, a;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            testSource = (0, _index.createMemorySource)("/test");
            testSource.history.pushState = jest.fn(testSource.history.pushState);
            testHistory = (0, _index.createHistory)(testSource);

            TestPage = function TestPage() {
              return _react["default"].createElement(_index.Link, {
                to: "/test",
                state: {
                  id: 1
                }
              }, "Go To Test");
            };

            div = document.createElement("div");

            _reactDom["default"].render(_react["default"].createElement(_index.LocationProvider, {
              history: testHistory
            }, _react["default"].createElement(_index.Router, null, _react["default"].createElement(TestPage, {
              path: "/test"
            }))), div);

            _context.prev = 6;
            a = div.querySelector("a");

            _testUtils["default"].Simulate.click(a, {
              button: 0
            });

            _context.next = 11;
            return testHistory.navigate("/test", {
              state: {
                id: 2
              }
            });

          case 11:
            _testUtils["default"].Simulate.click(a, {
              button: 0
            });

            expect(testSource.history.pushState).toHaveBeenCalledTimes(2);

          case 13:
            _context.prev = 13;

            _reactDom["default"].unmountComponentAtNode(div);

            return _context.finish(13);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[6,, 13, 16]]);
  })));
});
describe("transitions", function () {
  it("transitions pages",
  /*#__PURE__*/
  (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2() {
    var _runWithNavigation, snapshot, navigate;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _runWithNavigation = runWithNavigation(_react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
              path: "/"
            }), _react["default"].createElement(Reports, {
              path: "reports"
            }))), snapshot = _runWithNavigation.snapshot, navigate = _runWithNavigation.history.navigate;
            snapshot();
            _context2.next = 4;
            return navigate("/reports");

          case 4:
            snapshot();

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it("keeps the stack right on interrupted transitions",
  /*#__PURE__*/
  (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3() {
    var _runWithNavigation2, snapshot, history, navigate;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _runWithNavigation2 = runWithNavigation(_react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
              path: "/"
            }), _react["default"].createElement(Reports, {
              path: "reports"
            }), _react["default"].createElement(AnnualReport, {
              path: "annual-report"
            }))), snapshot = _runWithNavigation2.snapshot, history = _runWithNavigation2.history, navigate = _runWithNavigation2.history.navigate;
            navigate("/reports");
            _context3.next = 4;
            return navigate("/annual-report");

          case 4:
            snapshot();
            expect(history.index === 1);

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));
});
describe("relative navigate prop", function () {
  it("navigates relative",
  /*#__PURE__*/
  (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee4() {
    var relativeNavigate, User, Settings, _runWithNavigation3, snapshot;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            User = function User(_ref20) {
              var children = _ref20.children,
                  navigate = _ref20.navigate,
                  userId = _ref20.userId;
              relativeNavigate = navigate;
              return _react["default"].createElement("div", null, "User:", userId, children);
            };

            Settings = function Settings() {
              return _react["default"].createElement("div", null, "Settings");
            };

            _runWithNavigation3 = runWithNavigation(_react["default"].createElement(_index.Router, null, _react["default"].createElement(User, {
              path: "user/:userId"
            }, _react["default"].createElement(Settings, {
              path: "settings"
            }))), "/user/123"), snapshot = _runWithNavigation3.snapshot;
            snapshot();
            _context4.next = 6;
            return relativeNavigate("settings");

          case 6:
            snapshot();

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));
});
describe("nested routers", function () {
  it("allows arbitrary Router nesting through context", function () {
    var PageWithNestedApp = function PageWithNestedApp() {
      return _react["default"].createElement("div", null, "Home", _react["default"].createElement(ChatApp, null));
    };

    var ChatApp = function ChatApp() {
      return _react["default"].createElement(_index.Router, null, _react["default"].createElement(ChatHome, {
        path: "/home"
      }));
    };

    var ChatHome = function ChatHome() {
      return _react["default"].createElement("div", null, "Chat Home");
    };

    snapshot({
      pathname: "/chat/home",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(PageWithNestedApp, {
        path: "/chat/*"
      }))
    });
  });
});
describe("Match", function () {
  it("matches a path", function () {
    snapshot({
      pathname: "/groups/123",
      element: _react["default"].createElement(_index.Match, {
        path: "/groups/:groupId"
      }, function (props) {
        return _react["default"].createElement(PropsPrinter, props);
      })
    });
  });
});
describe("location", function () {
  it("correctly parses pathname, search and hash fields", function () {
    var testHistory = (0, _index.createHistory)((0, _index.createMemorySource)("/print-location?it=works&with=queries"));

    var wrapper = _reactTestRenderer["default"].create(_react["default"].createElement(_index.LocationProvider, {
      history: testHistory
    }, _react["default"].createElement(_index.Router, null, _react["default"].createElement(PrintLocation, {
      path: "/print-location"
    }))));

    var tree = wrapper.toJSON();
    expect(tree).toMatchSnapshot();
  });
}); // React 16.4 is buggy https://github.com/facebook/react/issues/12968
// so some tests are skipped

describe("ServerLocation", function () {
  var NestedRouter = function NestedRouter() {
    return _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
      path: "/home"
    }), _react["default"].createElement(_index.Redirect, {
      from: "/",
      to: "./home"
    }));
  };

  var App = function App() {
    return _react["default"].createElement(_index.Router, null, _react["default"].createElement(Home, {
      path: "/"
    }), _react["default"].createElement(Group, {
      path: "/groups/:groupId"
    }), _react["default"].createElement(_index.Redirect, {
      from: "/g/:groupId",
      to: "/groups/:groupId"
    }), _react["default"].createElement(NestedRouter, {
      path: "/nested/*"
    }), _react["default"].createElement(PrintLocation, {
      path: "/print-location"
    }));
  };

  it.skip("works", function () {
    expect((0, _server.renderToString)(_react["default"].createElement(_index.ServerLocation, {
      url: "/"
    }, _react["default"].createElement(App, null)))).toMatchSnapshot();
    expect((0, _server.renderToString)(_react["default"].createElement(_index.ServerLocation, {
      url: "/groups/123"
    }, _react["default"].createElement(App, null)))).toMatchSnapshot();
  });
  test.skip("redirects", function () {
    var redirectedPath = "/g/123";
    var markup;

    try {
      markup = (0, _server.renderToString)(_react["default"].createElement(_index.ServerLocation, {
        url: redirectedPath
      }, _react["default"].createElement(App, null)));
    } catch (error) {
      expect((0, _index.isRedirect)(error)).toBe(true);
      expect(error.uri).toBe("/groups/123");
    }

    expect(markup).not.toBeDefined();
  });
  test.skip("nested redirects", function () {
    var redirectedPath = "/nested";
    var markup;

    try {
      markup = (0, _server.renderToString)(_react["default"].createElement(_index.ServerLocation, {
        url: redirectedPath
      }, _react["default"].createElement(App, null)));
    } catch (error) {
      expect((0, _index.isRedirect)(error)).toBe(true);
      expect(error.uri).toBe("/nested/home");
    }

    expect(markup).not.toBeDefined();
  });
  test("location.search", function () {
    var markup = (0, _server.renderToStaticMarkup)(_react["default"].createElement(_index.ServerLocation, {
      url: "/print-location?it=works"
    }, _react["default"].createElement(App, null)));
    expect(markup).toContain("location.pathname: [/print-location]");
    expect(markup).toContain("location.search: [?it=works]");
  });
});
describe("trailing wildcard", function () {
  it("passes down wildcard name to the component as prop", function () {
    var FileBrowser = function FileBrowser(_ref21) {
      var filePath = _ref21.filePath;
      return filePath;
    };

    snapshot({
      pathname: "/files/README.md",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(FileBrowser, {
        path: "files/*filePath"
      }))
    });
  });
  it("passes down '*' as the prop name if not specified", function () {
    var FileBrowser = function FileBrowser(props) {
      return props["*"];
    };

    snapshot({
      pathname: "/files/README.md",
      element: _react["default"].createElement(_index.Router, null, _react["default"].createElement(FileBrowser, {
        path: "files/*"
      }))
    });
  });
  it("passes down to Match as well", function () {
    snapshot({
      pathname: "/somewhere/deep/i/mean/really/deep",
      element: _react["default"].createElement(_index.Match, {
        path: "/somewhere/deep/*rest"
      }, function (props) {
        return _react["default"].createElement("div", null, props.match.rest);
      })
    });
  });
  it("passes down to Match as unnamed '*'", function () {
    snapshot({
      pathname: "/somewhere/deep/i/mean/really/deep",
      element: _react["default"].createElement(_index.Match, {
        path: "/somewhere/deep/*"
      }, function (props) {
        return _react["default"].createElement("div", null, props.match["*"]);
      })
    });
  });
});