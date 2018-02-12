import React from 'react';
import {connect} from 'react-redux';
import {find, assign, once, flatten, pick, keyBy, mapKeys, mapValues} from 'lodash/fp';
import {reduceRight, trimChars, identity, filter, flow, get, set} from 'lodash/fp';
import {NavigationActions, createNavigator, addNavigationHelpers, StackRouter} from 'react-navigation';
import {mapValues as mapValuesWithKey} from 'lodash';
import {combineReducers} from 'redux';

export default class Module {
  component = null;
  navigable = true;
  namespace = '';
  name = '';
  path = '';
  basePath = '';
  submodules = [];
  navigationOptions = {};
  selectors = {};
  actions = {
    navigate: ({params, action}) => NavigationActions.navigate({routeName: this.fullname, params, action}),
    setRouteParams: ({params, key}) => NavigationActions.setParams({key, params})
  };
  initialState = {};
  reducers = {};
  effects = [];

  constructor(name, options = {}) {
    Object.assign(this, this.getValidOptions(options));
    this.name = name;
    this.fullname = this.name;
  }

  getValidOptions = pick([
    'path',
    'component',
    'navigable',
    'submodules',
    'navigationOptions',
    'initialState',
    'reducers',
    'effects',
    'selectors'
  ]);

  rootSelector(state, path) {
    return get(`${this.fullname}.${path}`, state);
  }

  getEffectRunners() {
    return flow(
      mapKeys(this.getFullActionName),
      mapValues(this.getEffectRunner)
    )(this.effects);
  }

  getFullActionName = key => {
    return `${this.fullname}/${key}`;
  };

  getEffectRunner = effect => (store, action) => {
    effect({
      ...this.getStateConsumptionHelpers(store.getState),
      ...this.getStateModificationHelpers(store.dispatch),
      action: action,
      payload: action.payload,
      module: this,
    });
  };

  getStateConsumptionHelpers = getState => {
    const state = getState();
    const route = get(`navigation.routes.${state.navigation.index}`, state);
    const routeName = get(`routeName`, route);
    const childModuleName = routeName.indexOf(this.fullname) === 0 && routeName.length > this.fullname.length
      ? routeName.substr(this.fullname.length + 1).split('.')[0]
      : null;
    const SubmoduleComponent = childModuleName
      ? this.findSubmodule(childModuleName).getComponent()
      : null;

    return {
      route, SubmoduleComponent,
      selectors: mapValues(selector => (...args) => selector(getState(), ...args), this.selectors),
      module: this,
      localState: get(this.fullname, state),
      getState,
      getLocalState: () => get(this.fullname, getState()),
      state,
    };
  };

  getStateModificationHelpers = dispatch => {
    return {
      actions: mapValues(action => flow(action, dispatch), this.actions),
      dispatch: dispatch,
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

    return (state = this.initialState, action) => {
      return reducer(pick(submoduleNames, state), action);
    };
  }

  getReducer() {
    const reducerMap = mapKeys(this.getFullActionName, this.reducers);
    const submoduleReducer = this.getSubmoduleReducer();

    return (state = this.initialState, action) => {
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

  initialize = () => {
    this.submodules.forEach(module => {
      module.setNamespace(this.fullname);
    });

    this.submodules.forEach(module => {
      module.setBasePath(this.getPath());
    });

    const actions = {
      ...this.effects,
      ...this.reducers
    };

    this.actions = assign(this.actions, mapValuesWithKey(actions, (action, key) => {
      const type = this.getFullActionName(key);
      return payload => ({type, payload});
    }));

    this.selectors = mapValues(selector => {
      return (state, ...args) => selector(this.getStateConsumptionHelpers(() => state), ...args);
    }, this.selectors);

    this.submodules.forEach(submodule => {
      submodule.initialize();
      this.initialState = set(submodule.name, submodule.initialState, this.initialState);
    });
  };

  getName() {
    return this.name || this.constructor.name;
  }

  setBasePath(basePath) {
    this.basePath = basePath;
  }

  getPath() {
    return filter(identity, [trimChars('/', this.basePath), trimChars('/', this.path)]).join('/');
  }

  setNamespace(namespace) {
    this.namespace = namespace;
    this.fullname = `${this.namespace}.${this.getName()}`;
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

  defaultMapStateToProps = ({localState, ...helpers}) => {
    return {...localState, ...helpers};
  };

  defaultMapDispatchToProps = ({actions, dispatch}) => {
    return {
      ...actions,
      dispatch
    };
  };

  hasComponent() {
    return !!this.component;
  }

  getComponent() {
    return this.component;
  }

  isNavigable() {
    return this.hasComponent() && this.navigable;
  }

  getNavigatorConfig() {
    if (!this.isNavigable()) {
      throw new Error(`cannot build navigation to module ${this.fullname}`);
    }

    return {
      path: this.getPath(),
      screen: () => null,
      navigationOptions: this.navigationOptions,
    };
  }

  getNavigator() {
    const screens = flow(
      filter(submodule => submodule.isNavigable()),
      keyBy(module => module.fullname),
      mapValues(module => module.getNavigatorConfig())
    )(this.getModules());

    return createNavigator(StackRouter(screens));
  }
}
