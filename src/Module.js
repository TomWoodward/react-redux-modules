import React from 'react';
import {assign, once, flatten, pick, keyBy, mapKeys, mapValues} from 'lodash/fp';
import {NavigationActions, createNavigator, addNavigationHelpers, TabRouter} from 'react-navigation';
import {mapValues as mapValuesWithKey} from 'lodash';
import {combineReducers} from 'redux';
import {filter, flow, get, set} from 'lodash/fp';

export default class Module {
  component = null;
  namespace = '';
  name = '';
  submodules = [];
  navigationOptions = {};

  actions = {
    navigate: () => NavigationActions.navigate({routeName: this.fullname})
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
    'component',
    'submodules',
    'navigationOptions',
    'initialState',
    'reducers',
    'effects',
  ]);

  getEffectRunners() {
    return flow(
      mapKeys(this.getFullActionName),
      mapValues(this.getEffectRunner)
    )(this.effects);
  }

  getFullActionName = key => {
    return `${this.fullname}/${key}`;
  };

  getEffectRunner = effect => (state, dispatch, action) => {
    effect({
      state, 
      localState: get(this.fullname, state),
      action: action,
      actions: this.actions,
      payload: action.payload,
      dispatch: dispatch,
    });
  };

  getSubmoduleReducer() {
    if (this.submodules.length === 0) {
      return state => state;
    }

    const submoduleNames = this.submodules.map(module => module.getName());
    const reducer = combineReducers(flow(
      keyBy(module => module.getName()),
      mapValues(module => module.getReducer()),
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
      module.initialize();
    });

    const actions = {
      ...this.effects,
      ...this.reducers
    };

    this.actions = assign(this.actions, mapValuesWithKey(actions, (action, key) => {
      const type = this.getFullActionName(key);
      return (...payload) => ({type, payload});
    }));
  };

  getName() {
    return this.name || this.constructor.name;
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

  defaultMapStateToProps = (state) => {
    return {
      ...get(this.fullname, state)
    }
  };

  defaultMapDispatchToProps = (dispatch) => {
    return {
      ...mapValues(action => flow(action, dispatch), this.actions),
      dispatch
    }
  };

  setComponent(component) {
    this.component = component;
  }

  hasComponent() {
    return !!this.component;
  }

  getComponent() {
    return this.component;
  }

  hasNavigator() {
    const submodulesWithComponent = filter(module => module.hasComponent(), this.submodules);
    return this.hasComponent() || submodulesWithComponent.length > 0;
  }

  getNavigatorConfig() {
    const submodulesWithComponent = filter(module => module.hasComponent(), this.submodules);

    if (!this.hasNavigator()) {
      throw new Error(`cannot build navigation to module ${this.fullname}`);
    }

    if (submodulesWithComponent.length > 0) {
      return {screen: this.getNavigator()};
    }

    return this.getOwnNavigatorConfig();
  }

  getOwnNavigatorConfig() {
    return {
      screen: this.component,
      navigationOptions: this.navigationOptions,
    };
  }

  getNavigator() {
    const screens = flow(
      filter(module => module.hasComponent()),
      keyBy(module => module.name),
      mapValues(module => module.getNavigatorConfig())
    )(this.submodules);

    if (this.component) {
      screens.index = this.getOwnNavigatorConfig();
    }

    const NavView = ({ navigation, router }) => {
      const {state} = navigation;
      const Component = router.getComponentForState(state);
      return React.createElement(Component, {navigation: addNavigationHelpers({
        ...navigation,
        state: state.routes[state.index],
      })});
    };

    return createNavigator(TabRouter(screens))(NavView);
  }
}
