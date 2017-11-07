import {mergeAll} from 'lodash/fp';

export default app => {
  const moduleEffects = app.getModules().map(module => module.getEffectRunners());
  const effects = mergeAll(moduleEffects);

  return store => next => action => {
    const result = next(action);

    if (effects[action.type]) {
      effects[action.type](store.getState(), store.dispatch, action);
    }

    return result;
  }
}
