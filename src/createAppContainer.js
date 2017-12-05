import React from 'react';
import {filter, keyBy, flow, reduce, mapValues, merge} from 'lodash/fp';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {connect, Provider} from 'react-redux';
import {NavigationActions, addNavigationHelpers} from 'react-navigation';
import {composeWithDevTools} from 'remote-redux-devtools';
import effectMiddleware from './effectMiddleware';
import navigationMiddleware, {dispatchNavigationActions} from './navigationMiddleware';
import browserHistoryMiddleware from './browserHistoryMiddleware';
import Module from './Module';

function isWeb() {
  return typeof window === "object";
}

export default function(app, options = {}) {
  app.initialize();

  const Navigator = app.getNavigator()(app.component);
  const {enableDevtools} = options;
  const initialPath = options.initialPath || isWeb() ? window.location.pathname.substr(1) : null;

  let initialRouterState = Navigator.router.getStateForAction(
      NavigationActions.init()
  );
  const initialRouterAction = Navigator.router.getActionForPathAndParams(initialPath);
  if (initialRouterAction) {
    initialRouterState = Navigator.router.getStateForAction(initialRouterAction, initialRouterState);
  }

  const navigationReducer = (state = initialRouterState, action) => {
    const nextState = Navigator.router.getStateForAction(action, state);
    return nextState || state;
  };

  const reducer = combineReducers({
    navigation: navigationReducer,
    [app.name]: app.getReducer(),
  });

  const composeEnhancers = enableDevtools
    ? isWeb() && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : composeWithDevTools({port: 8000})
    : compose;

  const middleware = [
    navigationMiddleware(app),
    effectMiddleware(app)
  ];

  if (isWeb()) {
    middleware.push(browserHistoryMiddleware(initialRouterAction, Navigator));
  }

  const enhancer = composeEnhancers(applyMiddleware(...middleware));
  const store = createStore(reducer, {}, enhancer);

  dispatchNavigationActions(app, store);

  const mapStateToProps = ({navigation}) => ({state: navigation});
  const NavigatorWithState = connect(mapStateToProps)(
    ({state, dispatch}) => <Navigator navigation={addNavigationHelpers({dispatch, state})} />
  );

  return () => <Provider store={store}>
    <NavigatorWithState /> 
  </Provider>;
}
