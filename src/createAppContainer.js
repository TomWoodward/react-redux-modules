import React from 'react';
import {get, map, identity, last, noop, filter, keyBy, flow, reduce, mapValues, merge} from 'lodash/fp';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import Loadable from 'react-loadable';
import {connect, Provider} from 'react-redux';
import {createBrowserHistory, createMemoryHistory} from 'history';
import {navigationReducer, navigationMiddleware, NavigationContainer, dispatchNavigationActions} from './navigation';
import EffectRunner from './EffectRunner';
import Module from './Module';

function isWeb() {
  return typeof window === "object";
}

export default function(app, options = {}) {
  const {enableDevtools} = options;
  const initialEntries = !isWeb() && options.initialHistory ? options.initialHistory : [];

  const history = isWeb() ? createBrowserHistory() : createMemoryHistory({initialEntries});

  const reducer = combineReducers({
    Navigation: navigationReducer(app, history),
    [app.getName()]: app.getReducer(),
  });

  const getComposeWithDevTools = () => {
    const {composeWithDevTools} = require('remote-redux-devtools');

    return isWeb() && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : composeWithDevTools({port: 8000})
  }

  const composeEnhancers = enableDevtools
    ? getComposeWithDevTools()
    : compose;

  const effectRunner = new EffectRunner(app, options.services);

  const middleware = [
    navigationMiddleware(app, history),
    effectRunner.middleware()
  ];

  const enhancer = composeEnhancers(applyMiddleware(...middleware));
  const initialState = options.initialState || {};
  const store = createStore(reducer, initialState, enhancer);
  const loadableReporter = options.loadableReporter || noop;

  const initialMatch = get('Navigation.match', store.getState());
  if (initialMatch) {
    dispatchNavigationActions(app, initialMatch, store.dispatch);
  }

  const Container = () => <Loadable.Capture report={loadableReporter}>
    <Provider store={store}>
      <NavigationContainer app={app} history={history} />
    </Provider>
  </Loadable.Capture>;

  return {
    effectRunner,
    Container,
    store,
    history
  }
}
