import React from 'react';
import {keyBy, once, get} from 'lodash/fp';
import {connect} from 'react-redux';

const CALL_HISTORY_METHOD = 'CALL_HISTORY_METHOD';
export const callHistoryMethod = (method, args) => {
  return {type: CALL_HISTORY_METHOD, payload: {method, args}};
};

const LOCATION_CHANGE = 'LOCATION_CHANGE';
export const locationChange = (location, match) => {
  return {type: LOCATION_CHANGE, payload: {location, match}};
};

export const navigationReducer = (app, history) => {
  const match = findRouteMatch(app, history.location);
  const initialState = {location: history.location, match};

  return (state = initialState, action) => {
    if (action.type === LOCATION_CHANGE) {
      return action.payload;
    }

    return state;
  }
};

const getModulesByName = once(app => keyBy(module => module.getFullName(), app.getModules()));

export const dispatchNavigationActions = (app, match, dispatch) => {
  const modulesByName = getModulesByName(app);
  const chunks = match.name.split('.');
  const moduleNames = chunks.map((name, i) => {
    return chunks.slice(0, i + 1).join('.');
  });

  moduleNames.forEach(name => {
    const module = modulesByName[name];
    const navigationAction = module.actions.receiveNavigation;

    if (navigationAction) {
      dispatch(navigationAction(match.params));
    }
  });
};

export const navigationMiddleware = (app, history) => store => {

  history.listen((location, action) => {
    const match = findRouteMatch(app, location);
    store.dispatch(locationChange(location, match));
    if (match) {
      dispatchNavigationActions(app, match, store.dispatch);
    }
  });

  return next => action => {
    if (action.type !== CALL_HISTORY_METHOD) {
      return next(action);
    }

    history[action.payload.method](...action.payload.args)
  };
};

const renderModule = (module, path = '') => {
  const [next, tail] = path.split(/\.(.+)/);
  const Component = module.getComponent();

  return <Component>
    {next && renderModule(module.findSubmodule(next), tail)}
  </Component>
};

export const HistoryContext = React.createContext({history: null});

export const NavigationContainer = connect(
  state => ({path: get('Navigation.match.name', state)})
)(
  ({path, app, history}) => <HistoryContext.Provider value={{history}}>
    {path ? renderModule(app, path.substring(path.indexOf('.') + 1)) : null}
  </HistoryContext.Provider>
);

function findRouteMatch(app, location) {
  return app.getModules().reduce((result, module) => {
    return result || (module.isNavigable() && module.matchPath(location.pathname));
  }, null);
}


