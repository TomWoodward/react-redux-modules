import {mergeAll, keyBy} from 'lodash/fp';
import {get} from 'lodash/fp';

export default app => {
  const modules = app.getModules();
  const moduleEffects = modules.map(module => module.getEffectRunners());
  const effects = mergeAll(moduleEffects);

  return store => next => action => {
    const result = next(action);

    if (effects[action.type]) {
      effects[action.type](store.getState(), store.dispatch, action);
    }

    return result;
  }
}
