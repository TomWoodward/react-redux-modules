import Module from './Module';
import createAppContainer from './createAppContainer';
import connect from './connect';

export {
  connect,
  Module,
  createAppContainer,
}

// polyfill for reactnavigation on safari, i don't even care anymore
if (!Object.entries) {
  Object.entries = obj => {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    let resArray = new Array(i);
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }
    return resArray;
  };
}
