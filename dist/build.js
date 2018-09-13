(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("lodash/fp");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _fp = __webpack_require__(1);

var _pathToRegexp = __webpack_require__(9);

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _navigation = __webpack_require__(3);

var _reactLoadable = __webpack_require__(5);

var _reactLoadable2 = _interopRequireDefault(_reactLoadable);

var _lodash = __webpack_require__(10);

var _redux = __webpack_require__(6);

var _connect = __webpack_require__(7);

var _connect2 = _interopRequireDefault(_connect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = function () {
  function Module(name) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Module);

    _initialiseProps.call(this);

    this.name = name;
    Object.assign(this, this.getValidOptions(options));

    if (this.path) {
      this.makePath = _pathToRegexp2.default.compile(this.path);
    }

    this.selectors = (0, _fp.mapValues)(function (selector) {
      return function (state) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return selector.apply(undefined, [_this.getStateConsumptionHelpers(state)].concat(args));
      };
    }, options.selectors);

    var actions = _extends({}, this.effects, this.reducers);

    this.actions = _extends({}, (0, _lodash.mapValues)(actions, function (action, key) {
      return function (payload) {
        return {
          type: _this.getFullActionName(key),
          payload: payload
        };
      };
    }), (0, _lodash.mapValues)(_extends({}, this.actions, options.actions), function (action, key) {
      return function () {
        var payload = action.apply(undefined, arguments);
        if (payload.type && payload.payload) {
          return payload;
        } else {
          return { type: _this.getFullActionName(key), payload: payload };
        }
      };
    }));

    if (options.root) {
      this.setNamespace('');
      this.setBasePath(options.basePath || '/');
    }
  }

  _createClass(Module, [{
    key: 'rootSelector',
    value: function rootSelector(state, path) {
      return (0, _fp.get)(this.getFullName() + '.' + path, state);
    }
  }, {
    key: 'getEffectRunners',
    value: function getEffectRunners() {
      return (0, _fp.flow)((0, _fp.mapKeys)(this.getFullActionName), (0, _fp.mapValues)(this.getEffectRunner))(this.effects);
    }
  }, {
    key: 'getSubmoduleReducer',
    value: function getSubmoduleReducer() {
      if (this.submodules.length === 0) {
        return function (state) {
          return state;
        };
      }

      var submoduleNames = this.submodules.map(function (module) {
        return module.getName();
      });
      var reducer = (0, _redux.combineReducers)((0, _fp.flow)((0, _fp.keyBy)(function (module) {
        return module.getName();
      }), (0, _fp.mapValues)(function (module) {
        return module.getReducer();
      }))(this.submodules));

      return function (state, action) {
        return reducer((0, _fp.pick)(submoduleNames, state), action);
      };
    }
  }, {
    key: 'getInitialState',
    value: function getInitialState() {
      var _this2 = this;

      return this.submodules.reduce(function (result, submodule) {
        return (0, _fp.set)(submodule.getName(), submodule.getInitialState(), _this2.initialState);
      }, this.initialState);
    }
  }, {
    key: 'getReducer',
    value: function getReducer() {
      var _this3 = this;

      var reducerMap = (0, _fp.mapKeys)(this.getFullActionName, this.reducers);
      var submoduleReducer = this.getSubmoduleReducer();

      return function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this3.getInitialState();
        var action = arguments[1];

        state = (0, _fp.assign)(state, submoduleReducer(state, action));

        if (reducerMap[action.type]) {
          return reducerMap[action.type]({
            module: _this3,
            localState: state,
            action: action,
            payload: action.payload
          });
        }

        return state;
      };
    }
  }, {
    key: 'getFullName',
    value: function getFullName() {
      return '' + (this.namespace ? this.namespace + '.' : '') + this.getName();
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.name;
    }
  }, {
    key: 'setBasePath',
    value: function setBasePath(basePath) {
      var _this4 = this;

      this.basePath = basePath;

      this.submodules.forEach(function (module) {
        module.setBasePath(_this4.getPath());
      });
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      return '/' + (0, _fp.filter)(_fp.identity, [(0, _fp.trimChars)('/', this.basePath), (0, _fp.trimChars)('/', this.path)]).join('/');
    }
  }, {
    key: 'setNamespace',
    value: function setNamespace(namespace) {
      var _this5 = this;

      this.namespace = namespace;

      this.submodules.forEach(function (module) {
        module.setNamespace(_this5.getFullName());
      });
    }
  }, {
    key: 'hasComponent',
    value: function hasComponent() {
      return !!this.component;
    }
  }, {
    key: 'isNavigable',
    value: function isNavigable() {
      return this.hasComponent() && this.navigable;
    }
  }]);

  return Module;
}();

var _initialiseProps = function _initialiseProps() {
  var _this6 = this;

  this.component = null;
  this.navigable = true;
  this.singleRoute = true;
  this.namespace = '';
  this.name = null;
  this.path = null;

  this.loadData = function () {};

  this.basePath = '';
  this.submodules = [];
  this.selectors = {};
  this.actions = {
    navigate: function navigate(params) {
      var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'push';
      return (0, _navigation.callHistoryMethod)(action, [_this6.makePath(params)]);
    }
  };
  this.initialState = {};
  this.reducers = {};
  this.effects = [];
  this.getValidOptions = (0, _fp.pick)(['component', 'effects', 'loadData', 'initialState', 'navigable', 'path', 'reducers', 'submodules']);

  this.getFullActionName = function (key) {
    return _this6.getFullName() + '/' + key;
  };

  this.getEffectRunner = function (effect) {
    return function (store, action, services) {
      return effect(_extends({}, _this6.getStateConsumptionHelpers(store.getState(), store.getState), _this6.getStateModificationHelpers(store.dispatch), {
        services: services,
        action: action,
        payload: action.payload
      }));
    };
  };

  this.getStateConsumptionHelpers = function (state) {
    var getState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return _extends({
      module: _this6,
      selectors: (0, _fp.mapValues)(function (selector) {
        return function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return selector.apply(undefined, [getState ? getState() : state].concat(args));
        };
      }, _this6.selectors),
      state: state,
      localState: (0, _fp.get)(_this6.getFullName(), state)
    }, getState ? {
      getState: getState,
      getLocalState: (0, _fp.flow)(getState, (0, _fp.get)(_this6.getFullName()))
    } : {});
  };

  this.getStateModificationHelpers = function (dispatch) {
    return {
      dispatch: dispatch,
      actions: (0, _fp.mapValues)(function (actionCreator) {
        return (0, _fp.flow)(actionCreator, dispatch);
      }, _this6.actions)
    };
  };

  this.getModules = (0, _fp.once)(function () {
    return [_this6].concat(_toConsumableArray(_this6.getSubmodules()));
  });
  this.getSubmodules = (0, _fp.once)(function () {
    return (0, _fp.flatten)(_this6.submodules.map(function (module) {
      return module.getModules();
    }));
  });

  this.findSubmodule = function (name) {
    return (0, _fp.find)({ name: name }, _this6.submodules);
  };

  this.defaultMapStateToProps = function (props) {
    return props;
  };

  this.defaultMapDispatchToProps = function (_ref) {
    var actions = _ref.actions,
        dispatch = _ref.dispatch;

    return {
      actions: actions,
      dispatch: dispatch
    };
  };

  this.getComponent = (0, _fp.once)(function () {
    return (0, _fp.flow)(function (component) {
      return component instanceof Promise ? (0, _reactLoadable2.default)({ loader: function loader() {
          return _this6.component;
        }, loading: function loading() {
          return null;
        } }) : component;
    }, function (component) {
      return (0, _connect2.default)(_this6, component);
    })(_this6.component);
  });
  this.matchPath = (0, _fp.memoize)(function (path) {
    var result = {
      name: _this6.getFullName(),
      params: {}
    };

    if (!_this6.path) {
      return result;
    }

    var keys = [];
    var re = (0, _pathToRegexp2.default)(_this6.getPath(), keys, { end: true });
    var match = re.exec(path);

    if (!match) {
      return false;
    }

    var _match = _toArray(match),
        url = _match[0],
        values = _match.slice(1);

    return _extends({}, result, {
      params: keys.reduce(function (result, key, index) {
        var value = values[index] ? decodeURIComponent(values[index]) : values[index];
        return (0, _fp.set)(key.name, value, result);
      }, {})
    });
  });
};

exports.default = Module;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationContainer = exports.HistoryContext = exports.navigationMiddleware = exports.dispatchNavigationActions = exports.navigationReducer = exports.locationChange = exports.callHistoryMethod = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _fp = __webpack_require__(1);

var _reactRedux = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var CALL_HISTORY_METHOD = 'CALL_HISTORY_METHOD';
var callHistoryMethod = exports.callHistoryMethod = function callHistoryMethod(method, args) {
  return { type: CALL_HISTORY_METHOD, payload: { method: method, args: args } };
};

var LOCATION_CHANGE = 'LOCATION_CHANGE';
var locationChange = exports.locationChange = function locationChange(location, match) {
  return { type: LOCATION_CHANGE, payload: { location: location, match: match } };
};

var navigationReducer = exports.navigationReducer = function navigationReducer(app, history) {
  var match = findRouteMatch(app, history.location);
  var initialState = { location: history.location, match: match };

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    if (action.type === LOCATION_CHANGE) {
      return action.payload;
    }

    return state;
  };
};

var getModulesByName = (0, _fp.once)(function (app) {
  return (0, _fp.keyBy)(function (module) {
    return module.getFullName();
  }, app.getModules());
});

var dispatchNavigationActions = exports.dispatchNavigationActions = function dispatchNavigationActions(app, match, dispatch) {
  var modulesByName = getModulesByName(app);
  var chunks = match.name.split('.');
  var moduleNames = chunks.map(function (name, i) {
    return chunks.slice(0, i + 1).join('.');
  });

  moduleNames.forEach(function (name) {
    var module = modulesByName[name];
    var navigationAction = module.actions.receiveNavigation;

    if (navigationAction) {
      dispatch(navigationAction(match.params));
    }
  });
};

var navigationMiddleware = exports.navigationMiddleware = function navigationMiddleware(app, history) {
  return function (store) {

    history.listen(function (location, action) {
      var match = findRouteMatch(app, location);
      store.dispatch(locationChange(location, match));
      if (match) {
        dispatchNavigationActions(app, match, store.dispatch);
      }
    });

    return function (next) {
      return function (action) {
        if (action.type !== CALL_HISTORY_METHOD) {
          return next(action);
        }

        history[action.payload.method].apply(history, _toConsumableArray(action.payload.args));
      };
    };
  };
};

var renderModule = function renderModule(module) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var _path$split = path.split(/\.(.+)/),
      _path$split2 = _slicedToArray(_path$split, 2),
      next = _path$split2[0],
      tail = _path$split2[1];

  var Component = module.getComponent();

  return _react2.default.createElement(
    Component,
    null,
    next && renderModule(module.findSubmodule(next), tail)
  );
};

var HistoryContext = exports.HistoryContext = _react2.default.createContext({ history: null });

var NavigationContainer = exports.NavigationContainer = (0, _reactRedux.connect)(function (state) {
  return { path: (0, _fp.get)('Navigation.match.name', state) };
})(function (_ref) {
  var path = _ref.path,
      app = _ref.app,
      history = _ref.history;
  return _react2.default.createElement(
    HistoryContext.Provider,
    { value: { history: history } },
    path ? renderModule(app, path.substring(path.indexOf('.') + 1)) : null
  );
});

function findRouteMatch(app, location) {
  return app.getModules().reduce(function (result, module) {
    return result || module.isNavigable() && module.matchPath(location.pathname);
  }, null);
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("react-redux");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("react-loadable");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactRedux = __webpack_require__(4);

var _Module = __webpack_require__(2);

var _Module2 = _interopRequireDefault(_Module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (module, component) {
  var getModule = module instanceof _Module2.default ? function () {
    return module;
  } : module;

  var getMapStateToProps = function getMapStateToProps(component, module) {
    return module ? component.mapStateToProps || module.defaultMapStateToProps : function () {
      return {};
    };
  };
  var getMapDispatchToProps = function getMapDispatchToProps(component, module) {
    return module ? component.mapDispatchToProps || module.defaultMapDispatchToProps : function () {
      return {};
    };
  };

  var mapStateToProps = function mapStateToProps(state, ownProps) {
    var module = getModule();

    return getMapStateToProps(component, module)(_extends({
      ownProps: ownProps
    }, module.getStateConsumptionHelpers(state)));
  };
  var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
    var module = getModule();
    return getMapDispatchToProps(component, module)(_extends({
      ownProps: ownProps
    }, module.getStateModificationHelpers(dispatch)));
  };

  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(component);
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAppContainer = exports.Link = exports.Module = exports.connect = undefined;

var _Module = __webpack_require__(2);

var _Module2 = _interopRequireDefault(_Module);

var _createAppContainer = __webpack_require__(11);

var _createAppContainer2 = _interopRequireDefault(_createAppContainer);

var _connect = __webpack_require__(7);

var _connect2 = _interopRequireDefault(_connect);

var _Link = __webpack_require__(15);

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.connect = _connect2.default;
exports.Module = _Module2.default;
exports.Link = _Link2.default;
exports.createAppContainer = _createAppContainer2.default;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("path-to-regexp");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (app) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var enableDevtools = options.enableDevtools;

  var initialEntries = !isWeb() && options.initialHistory ? options.initialHistory : [];

  var history = isWeb() ? (0, _history.createBrowserHistory)() : (0, _history.createMemoryHistory)({ initialEntries: initialEntries });

  var reducer = (0, _redux.combineReducers)(_defineProperty({
    Navigation: (0, _navigation.navigationReducer)(app, history)
  }, app.getName(), app.getReducer()));

  var getComposeWithDevTools = function getComposeWithDevTools() {
    var _require = __webpack_require__(12),
        composeWithDevTools = _require.composeWithDevTools;

    return isWeb() && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : composeWithDevTools({ port: 8000 });
  };

  var composeEnhancers = enableDevtools ? getComposeWithDevTools() : _redux.compose;

  var effectRunner = new _EffectRunner2.default(app, options.services);

  var middleware = [(0, _navigation.navigationMiddleware)(app, history), effectRunner.middleware()];

  var enhancer = composeEnhancers(_redux.applyMiddleware.apply(undefined, middleware));
  var initialState = options.initialState || {};
  var store = (0, _redux.createStore)(reducer, initialState, enhancer);
  var loadableReporter = options.loadableReporter || _fp.noop;

  var initialMatch = (0, _fp.get)('Navigation.match', store.getState());
  if (initialMatch) {
    (0, _navigation.dispatchNavigationActions)(app, initialMatch, store.dispatch);
  }

  var Container = function Container() {
    return _react2.default.createElement(
      _reactLoadable2.default.Capture,
      { report: loadableReporter },
      _react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(_navigation.NavigationContainer, { app: app, history: history })
      )
    );
  };

  return {
    effectRunner: effectRunner,
    Container: Container,
    store: store,
    history: history
  };
};

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _fp = __webpack_require__(1);

var _redux = __webpack_require__(6);

var _reactLoadable = __webpack_require__(5);

var _reactLoadable2 = _interopRequireDefault(_reactLoadable);

var _reactRedux = __webpack_require__(4);

var _history = __webpack_require__(13);

var _navigation = __webpack_require__(3);

var _EffectRunner = __webpack_require__(14);

var _EffectRunner2 = _interopRequireDefault(_EffectRunner);

var _Module = __webpack_require__(2);

var _Module2 = _interopRequireDefault(_Module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isWeb() {
  return (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === "object";
}

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("remote-redux-devtools");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("history");

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EffectMiddleware;

var _fp = __webpack_require__(1);

function EffectMiddleware(app, services) {
  var _this = this;

  var modules = app.getModules();
  var moduleEffects = modules.map(function (module) {
    return module.getEffectRunners();
  });
  var effects = (0, _fp.mergeAll)(moduleEffects);
  var promises = [];

  this.stopped = false;
  this.stop = function () {
    _this.stopped = true;
  };
  this.cool = function () {
    var count = promises.length;
    return Promise.all(promises).then(function () {
      if (count !== promises.length) {
        return _this.cool();
      }
    });
  };
  this.down = function () {
    return _this.cool().then(_this.stop);
  };

  this.middleware = function () {
    return function (store) {
      return function (next) {
        return function (action) {
          var result = next(action);

          if (!_this.stopped && effects[action.type]) {
            promises.push(effects[action.type](store, action, services));
          }

          return result;
        };
      };
    };
  };
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _navigation = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

exports.default = function (_ref) {
  var to = _ref.to,
      props = _objectWithoutProperties(_ref, ['to']);

  return _react2.default.createElement(
    _navigation.HistoryContext.Consumer,
    null,
    function (_ref2) {
      var history = _ref2.history;
      return _react2.default.createElement('a', _extends({ href: to }, props, { onClick: function onClick(e) {
          e.preventDefault();
          history.push(to);
          props.onClick && props.onClick(e);
        } }));
    }
  );
};

/***/ })
/******/ ]);
});