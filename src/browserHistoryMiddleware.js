import {get} from 'lodash/fp';

export default navigation => store => {
  const router = navigation.router;

  window.onpopstate = e => {
    e.preventDefault();
    const action = router.getActionForPathAndParams(window.location.pathname.substr(1));
    if (action) {
      store.dispatch(action);
    }
  };
  
  return next => action => {
    const result = next(action);

    switch (action.type) {
      case 'Navigation/NAVIGATE': {
        const state = store.getState().navigation;
        const title = get(`routes.${state.index}.params.title`, state);
        const {path} = router.getPathAndParamsForState(state);
        window.history.pushState({}, title, '/' + path);
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
