import {mergeAll, keyBy, get, once} from 'lodash/fp';

const getModulesByName = once(app => keyBy('fullname', app.getModules()));

export function dispatchNavigationActions(app, store) {
  const state = store.getState().navigation;
  const modulesByName = getModulesByName(app);
  const routeName = get(`routes.${state.index}.routeName`, state);
  const chunks = routeName.split('.');
  const moduleNames = chunks.map((name, i) => {
    return chunks.slice(0, i + 1).join('.');
  });

  moduleNames.forEach(name => {
    const module = modulesByName[name];
    const navigationAction = module.actions.receiveNavigation;

    if (navigationAction) {
      store.dispatch(navigationAction());
    }
  });
}

export default app => store => next => action => {
  const result = next(action);

  if (['Navigation/NAVIGATE', 'Navigation/BACK', 'Navigation/RESET'].indexOf(action.type) > -1) {
    dispatchNavigationActions(app, store);
  }

  return result;
}
