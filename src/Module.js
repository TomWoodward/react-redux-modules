import React from 'react';
import {assign, once, flatten, pick, keyBy, mapKeys, mapValues} from 'lodash/fp';
import {NavigationActions, createNavigator, addNavigationHelpers, StackRouter} from 'react-navigation';
import {mapValues as mapValuesWithKey} from 'lodash';
import {combineReducers} from 'redux';
import {reduceRight, trimChars, identity, filter, flow, get, set} from 'lodash/fp';

export default class Module {
  component = null;
  container = null;
  containers = [];
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
    'container',
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
      route:  get(`navigation.routes.${state.navigation.index}`, state),
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

    this.submodules.forEach(module => {
      module.setBasePath(this.getPath());
    });

    if (this.hasContainer()) {
      this.containers.push(this.getContainer());
    }

    this.submodules.forEach(module => {
      module.setContainers(this.containers);
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
      return state => selector(this.getStateConsumptionHelpers(state));
    }, this.selectors);

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

  defaultMapStateToProps = ({localState}) => {
    return localState;
  };

  defaultMapDispatchToProps = ({actions, dispatch}) => {
    return {
      ...actions,
      dispatch
    };
  };

  setContainers(containers) {
    this.containers = containers;
  }

  hasContainer() {
    return !!this.container;
  }

  getContainer() {
    return this.container;
  }

  hasComponent() {
    return !!this.component;
  }

  getComponent() {
    const elements = [...this.containers, this.component];
    return () => reduceRight((element, result) => React.createElement(element, {}, result), null, elements);
  }

  isNavigable() {
    return this.hasComponent();
  }

  getNavigatorConfig() {
    if (!this.isNavigable()) {
      throw new Error(`cannot build navigation to module ${this.fullname}`);
    }

    return {
      path: this.getPath(),
      screen: this.getComponent(),
      navigationOptions: this.navigationOptions,
    };
  }

  getNavigator() {
    const screens = flow(
      filter(submodule => submodule.isNavigable()),
      keyBy(module => module.fullname),
      mapValues(module => module.getNavigatorConfig())
    )(this.getModules());

    const NavView = ({ navigation, router }) => {
      const {state} = navigation;
      const content = React.createElement(router.getComponentForState(state), {navigation: addNavigationHelpers({
        ...navigation,
        state: state.routes[state.index],
      })});
  
      return content;
    };

    return createNavigator(StackRouter(screens))(NavView);
  }
}
