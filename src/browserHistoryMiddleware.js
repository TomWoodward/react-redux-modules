import {NavigationActions} from 'react-navigation';
import {get} from 'lodash/fp';

export default (initialRouterAction, navigation) => store => {
  const router = navigation.router;
  const state = store.getState().navigation;
  const title = get(`routes.${state.index}.params.title`, state);

  window.history.replaceState({actions: [initialRouterAction]}, title);

  window.onpopstate = e => {
    const actions = e.state.actions;
    store.dispatch(NavigationActions.reset({
      index: actions.length - 1,
      actions
    }));
  };
  
  return next => action => {
    const result = next(action);

    switch (action.type) {
      case 'Navigation/NAVIGATE': {
        const state = store.getState().navigation;
        const title = get(`routes.${state.index}.params.title`, state);
        const {path} = router.getPathAndParamsForState(state);
        window.history.pushState({
          actions: [...window.history.state.actions, action]
        }, title, '/' + path);
        break;
      }
      case 'Navigation/SET_PARAMS': {
        const state = store.getState().navigation;
        const title = get(`routes.${state.index}.params.title`, state);
        if (title) {
          document.title = title;
        }
      }
    }

    return result;
  }
}
