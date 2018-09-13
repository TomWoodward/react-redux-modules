import {mergeAll, keyBy, get} from 'lodash/fp';

export default function EffectMiddleware(app, services) {
  const modules = app.getModules();
  const moduleEffects = modules.map(module => module.getEffectRunners());
  const effects = mergeAll(moduleEffects);
  const promises = [];

  this.stopped = false;
  this.stop = () => {
    this.stopped = true;
  };
  this.cool = () => {
    const count = promises.length;
    return Promise.all(promises)
      .then(() => {
        if (count !== promises.length) {
          return this.cool();
        }
      });
  };
  this.down = () => this.cool().then(this.stop);

  this.middleware = () => store => next => action => {
    const result = next(action);

    if (!this.stopped && effects[action.type]) {
      promises.push(effects[action.type](store, action, services));
    }

    return result;
  }
};
