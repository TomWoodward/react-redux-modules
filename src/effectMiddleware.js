import {mergeAll, keyBy} from 'lodash/fp';

export default app => {
  const modules = app.getModules();
  const modulesByName = keyBy('fullname', modules);
  const moduleEffects = modules.map(module => module.getEffectRunners());
  const effects = mergeAll(moduleEffects);

  return store => next => action => {
    const result = next(action);

    if (action.type === 'Navigation/NAVIGATE') {
      const chunks = action.routeName.split('.');
      const moduleNames = chunks.map((name, i) => {
        return chunks.slice(0, i + 1).join('.');
      });

      moduleNames.forEach(name => {
        const module = modulesByName[name];
        const navigationAction = module.actions.receiveNavigation;

        if (navigationAction) {
          store.dispatch(navigationAction(action));
        }
      });
    }

    if (effects[action.type]) {
      effects[action.type](store.getState(), store.dispatch, action);
    }

    return result;
  }
}
