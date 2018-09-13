import React from 'react';
import {memoize, getOr, map, find, assign, once, flatten, pick, keyBy, mapKeys, mapValues, reduceRight, trimChars, identity, filter, flow, get, set} from 'lodash/fp';
import pathToRegexp from 'path-to-regexp';
import {callHistoryMethod} from './navigation';
import Loadable from 'react-loadable'
import {mapValues as mapValuesWithKey} from 'lodash';
import {combineReducers, connect as reduxConnect} from 'redux';
import connect from './connect';

export default class Module {
  component = null;
  navigable = true;
  singleRoute = true;
  namespace = '';
  name = null;
  path = null;
  loadData = () => {};
  basePath = '';
  submodules = [];
  selectors = {};
  actions = {
    navigate: (params, action = 'push') => callHistoryMethod(action, [this.makePath(params)])
  };
  initialState = {};
  reducers = {};
  effects = [];

  constructor(name, options = {}) {
    this.name = name;
    Object.assign(this, this.getValidOptions(options));

    if (this.path) {
      this.makePath = pathToRegexp.compile(this.path);
    }

    this.selectors = mapValues(selector => {
      return (state, ...args) => selector(this.getStateConsumptionHelpers(state), ...args);
    }, options.selectors);

    const actions = {
      ...this.effects,
      ...this.reducers
    };

    this.actions = {
      ...mapValuesWithKey(actions, (action, key) => {
        return payload => {
          return {
            type: this.getFullActionName(key),
            payload
          };
        };
      }),
      ...mapValuesWithKey({...this.actions, ...options.actions}, (action, key) => {
        return (...args) => {
          const payload = action(...args);
          if (payload.type && payload.payload) {
            return payload;
          } else {
            return {type: this.getFullActionName(key), payload}
          }
        };
      })
    };

    if (options.root) {
      this.setNamespace('');
      this.setBasePath(options.basePath || '/');
    }
  }

  getValidOptions = pick([
    'component',
    'effects',
    'loadData',
    'initialState',
    'navigable',
    'path',
    'reducers',
    'submodules',
  ]);

  rootSelector(state, path) {
    return get(`${this.getFullName()}.${path}`, state);
  }

  getEffectRunners() {
    return flow(
      mapKeys(this.getFullActionName),
      mapValues(this.getEffectRunner)
    )(this.effects);
  }

  getFullActionName = key => {
    return `${this.getFullName()}/${key}`;
  };

  getEffectRunner = effect => (store, action, services) => {
    return effect({
      ...this.getStateConsumptionHelpers(store.getState(), store.getState),
      ...this.getStateModificationHelpers(store.dispatch),
      services,
      action: action,
      payload: action.payload,
    });
  };

  getStateConsumptionHelpers = (state, getState = null) => {
    return {
      module: this,
      selectors: mapValues(selector => (...args) => selector(getState ? getState() : state, ...args), this.selectors),
      state,
      localState: get(this.getFullName(), state),
      ...(getState
        ? {
          getState,
          getLocalState: flow(getState, get(this.getFullName())),
        }
        : {}
      )
    };
  };

  getStateModificationHelpers = dispatch => {
    return {
      dispatch,
      actions: mapValues(actionCreator => flow(actionCreator, dispatch), this.actions),
    };
  };

  getSubmoduleReducer() {
    if (this.submodules.length === 0) {
      return state => state;
    }

    const submoduleNames = this.submodules.map(module => module.getName());
    const reducer = combineReducers(flow(
      keyBy(module => module.getName()),
      mapValues(module => module.getReducer())
    )(this.submodules));

    return (state, action) => {
      return reducer(pick(submoduleNames, state), action);
    };
  }

  getInitialState() {
    return this.submodules.reduce((result, submodule) => {
      return set(submodule.getName(), submodule.getInitialState(), this.initialState);
    }, this.initialState);
  }

  getReducer() {
    const reducerMap = mapKeys(this.getFullActionName, this.reducers);
    const submoduleReducer = this.getSubmoduleReducer();

    return (state = this.getInitialState(), action) => {
      state = assign(state, submoduleReducer(state, action));

      if (reducerMap[action.type]) {
        return reducerMap[action.type]({
          module: this,
          localState: state,
          action: action,
          payload: action.payload
        });
      }

      return state;
    };
  }

  getFullName() {
    return `${this.namespace ? `${this.namespace}.` : ''}${this.getName()}`;
  }

  getName() {
    return this.name;
  }

  setBasePath(basePath) {
    this.basePath = basePath;

    this.submodules.forEach(module => {
      module.setBasePath(this.getPath());
    });
  }

  getPath() {
    return '/' + filter(identity, [trimChars('/', this.basePath), trimChars('/', this.path)]).join('/');
  }

  setNamespace(namespace) {
    this.namespace = namespace;

    this.submodules.forEach(module => {
      module.setNamespace(this.getFullName());
    });
  }

  getModules = once(() => {
    return [this, ...this.getSubmodules()]
  });

  getSubmodules = once(() => {
    return flatten(this.submodules.map(module => module.getModules()));
  });

  findSubmodule = (name) => {
    return find({name}, this.submodules);
  }

  defaultMapStateToProps = props => {
    return props;
  };

  defaultMapDispatchToProps = ({actions, dispatch}) => {
    return {
      actions,
      dispatch
    };
  };

  hasComponent() {
    return !!this.component;
  }

  getComponent = once(() => {
    return flow(
      component => component instanceof Promise
        ? Loadable({loader: () => this.component, loading: () => null})
        : component,
      component => connect(this, component)
    )(this.component);
  });

  isNavigable() {
    return this.hasComponent() && this.navigable;
  }

  matchPath = memoize(path => {
    const result = {
      name: this.getFullName(),
      params: {}
    };

    if (!this.path) {
      return result;
    }

    const keys = [];
    const re = pathToRegexp(this.getPath(), keys, {end: true});
    const match = re.exec(path);

    if (!match) {
      return false;
    }

    const [url, ...values] = match;

    return {
      ...result,
      params: keys.reduce((result, key, index) => {
        const value = values[index] ? decodeURIComponent(values[index]) : values[index];
        return set(key.name, value, result)
      }, {})
    }
  });
}
