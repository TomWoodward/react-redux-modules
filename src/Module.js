import React from 'react';
import {assign, once, flatten, pick, keyBy, mapKeys, mapValues} from 'lodash/fp';
import {NavigationActions, createNavigator, addNavigationHelpers, StackRouter} from 'react-navigation';
import {mapValues as mapValuesWithKey} from 'lodash';
import {combineReducers} from 'redux';
import {identity, filter, flow, get, set} from 'lodash/fp';

export default class Module {
  component = null;
  namespace = '';
  name = '';
  path = '';
  basePath = '';
  submodules = [];
  navigationOptions = {};

  actions = {
    navigate: ({params, action}) => NavigationActions.navigate({routeName: this.fullname, params, action})
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
    'submodules',
    'navigationOptions',
    'initialState',
    'reducers',
    'effects',
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

  getEffectRunner = effect => (state, dispatch, action) => {
    effect({
      ...this.getStateConsumptionHelpers(state),
      ...this.getStateModificationHelpers(dispatch),
      action: action,
      payload: action.payload,
      module: this,
    });
  };

  getStateConsumptionHelpers = state => {
    return {
      route: get(`navigation.routes.${state.navigation.index}`, state),
      localState: get(this.fullname, state),
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
    });

    if (!this.namespace) {
      this.submodules.forEach(module => {
        module.setBasePath(this.path);
      });
    }

    const actions = {
      ...this.effects,
      ...this.reducers
    };

    this.actions = assign(this.actions, mapValuesWithKey(actions, (action, key) => {
      const type = this.getFullActionName(key);
      return payload => ({type, payload});
    }));

    this.submodules.forEach(module => {
      module.initialize();
    });
  };

  getName() {
    return this.name || this.constructor.name;
  }

  setBasePath(basePath) {
    this.basePath = basePath;
  }

  getPath() {
    return filter(identity, [this.basePath, this.path]).join('/');
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

  defaultMapStateToProps = ({localState}) => {
    return localState;
  };

  defaultMapDispatchToProps = ({actions, dispatch}) => {
    return {
      ...actions,
      dispatch
    };
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

  getNavigableSubmodules() {
    return filter(module => module.isNavigable(), this.submodules);
  }

  hasNavigableSubmodules() {
    return this.getNavigableSubmodules().length > 0;
  }

  isNavigable() {
    return this.hasComponent() || this.hasNavigableSubmodules();
  }

  getNavigatorConfig() {
    if (!this.isNavigable()) {
      throw new Error(`cannot build navigation to module ${this.fullname}`);
    }

    if (this.hasNavigableSubmodules()) {
      return {
        path: this.getPath(),
        screen: this.getNavigator(),
        navigationOptions: this.navigationOptions,
      };
    }

    return {
      screen: this.component,
      path: this.getPath(),
      navigationOptions: this.navigationOptions,
    };
  }

  getNavigator() {
    const screens = flow(
      keyBy(module => module.fullname),
      mapValues(module => module.getNavigatorConfig())
    )(this.getNavigableSubmodules());

    const NavView = ({ navigation, router }) => {
      const {state} = navigation;
      const content = React.createElement(router.getComponentForState(state), {navigation: addNavigationHelpers({
        ...navigation,
        state: state.routes[state.index],
      })});

      if (this.hasComponent()) {
        return React.createElement(this.getComponent(), {}, content);
      } else {
        return content;
      }
    };

    return createNavigator(StackRouter(screens))(NavView);
  }
}
