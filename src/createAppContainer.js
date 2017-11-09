import React from 'react';
import {filter, keyBy, flow, reduce, mapValues, merge} from 'lodash/fp';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {connect, Provider} from 'react-redux';
import {addNavigationHelpers} from 'react-navigation';
import {composeWithDevTools} from 'remote-redux-devtools';
import effectMiddleware from './effectMiddleware';
import browserHistoryMiddleware from './browserHistoryMiddleware';
import Module from './Module';

function isWeb() {
  return typeof window === "object";
}

export default function(app, options = {}) {
  app.initialize();

  if (!app.isNavigable()) {
    throw new Error(`Root module ${app.name} must be navigable`);
  }

  const Navigator = app.getNavigator();
  const {enableDevtools} = options;
  const initialPath = options.initialPath || isWeb() ? window.location.pathname.substr(1) : null;
  const initialRouterAction = Navigator.router.getActionForPathAndParams(initialPath);
  const initialRouterState = initialRouterAction ? Navigator.router.getStateForAction(initialRouterAction) : null;

  const navigationReducer = (state = initialRouterState, action) => {
    const nextState = Navigator.router.getStateForAction(action, state);
    return nextState || state;
  };

  const reducer = combineReducers({
    navigation: navigationReducer,
    App: app.getReducer(),
  });

  const composeEnhancers = enableDevtools
    ? isWeb() && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : composeWithDevTools({port: 8000})
    : compose;

  const middleware = [
    effectMiddleware(app)
  ];

  if (isWeb()) {
    middleware.push(browserHistoryMiddleware(initialRouterAction, Navigator));
  }

  const enhancer = composeEnhancers(applyMiddleware(...middleware));
  const store = createStore(reducer, {}, enhancer);

  const mapStateToProps = ({navigation}) => ({state: navigation});
  const NavigatorWithState = connect(mapStateToProps)(
    ({state, dispatch}) => <Navigator navigation={addNavigationHelpers({dispatch, state})} />
  );

  return () => <Provider store={store}>
    <NavigatorWithState /> 
  </Provider>;
}
