# react-redux-modules as a way to organize react-redux

## Modules

```js
import {Module} from 'react-redux-modules';

export default new Module('MyModule');
```

A module ties together the common elements of a redux domain. The reducer, actions and side effects are all
covered by module configurations. Modules also handle elements outside the redux state, like navigation and
the default react component.

The only requirement for module is its name. The empy module shown above will generate a new section of the redux
state called `MyModule`, but other than that do nothing.

### Main Component
```js
// - /myModule/module.js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';

export default new Module('MyModule', {
  component: MainComponent
});
```

```js
// - /myModule/MainComponent.js
import React from 'react';  
import module from './module';

export default function MainComponent() {
  return <h1>Hello World</h1>;
}
```

The `component` property of a module is the component that is rendered when this module is navigated to. The
module component is connected to the redux state by default. see the [connect](#connecting-components) section
for how to configure the connection behavior.

### Connecting Components

```js
// - /myModule/SomeComponent.js
import React from 'react';  
import {connect} from 'react-redux-modules'; 
import module from './module';

function SomeComponent() {
  return <h1>Hello World</h1>;
}

export default connect(() => module, SomeComponent);
```

The `connect` function connects a component to the module state. By default `connect` passes the [state modification](#state-modification-helpers) and [state consumption](#state-consumption-helpers) helpers as props. This can be changed by providing a static `mapStateToProps` and/or `mapDispatchToProps` on the component, these functions will receive the helpers and allow you to filter or modify them before being applied to the component.

Note that the first argument to `connect` can be either `module` or `() => module`, the latter being a workaround for the cyclical dependencies you may find yourself with between components and modules.

### Reducers

```js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';
import {set} from 'lodash/fp';

export default new Module('MyModule', {
  component: MainComponent,
  initialState: {
    counter: 0
  },
  reducers: {
    onCount: ({localState, payload}) => set('counter', localState.counter + 1, state)
  }
});
```

Reducers are defined as a map of action names to reducer functions, `initialState` is optional and is empty by default. Reducer functions receive one argument which is an object containing [state consumption helpers](#state-consumption-helpers) plus `action` and `payload`.

### Effects

```js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';

export default new Module('MyModule', {
  component: MainComponent,
  effects: {
    yell: () => alert('HELLO WORLD')  
  }
});
```

Effects are tied to a single action and will be triggered after the action is reduced. Effects are plain functions
and can be used for whatever side effects you want, async, whatever. Effects receive one argument which is an object containing both [state modification](#state-modification-helpers) and [state consumption](#state-consumption-helpers) helpers plus `action` and `payload`.

### Selectors

```js
import {Module} from 'react-redux-modules';

export default new Module('MyModule', {
  component: MainComponent,
  selectors: {
    getSomething: ({localState}) => localState.someValue,
    getThing: ({localState}, thing) => localState[thing]
  }
  effects: {
    yell: ({selectors}) => alert(selectors.getSomething()),
    yell2: ({selectors}) => alert(selectors.getThing('thing'))
  }
});
```

Selectors are used to retrieve values from the module state. Selectors are useful for abstracting the exact structure of your state or generating derived values. Selectors receive a first argument containing [state consumption helpers](#state-consumption-helpers) provided automatically, subsequent arguments can be optionally provided.

### Actions

```js
import {Module} from 'react-redux-modules';
import otherModule from '../other/place/module';
import MainComponent from './MainComponent';

export default new Module('MyModule', {
  component: MainComponent,
  effects: {
    alarm: ({actions}) => actions.snooze(),
    snooze: ({dispatch}) => dispatch(otherModule.actions.snooze())   
  }
});
```

Any action referenced in either the reducer or effect configs (doesn't have to be in both) gets an automatically generated action creator. The default action creator invents a `type` property based on the name of the action, and sets the first argument passed in to the action payload. You can change this behavior by defining an action creator in the `actions` property, A custom action creator must return an object with keys `type` and `payload` or a type will be made for you and the result will be saved as the payload.

### Submodules

```js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';
import submodule1 from './submodule1';
import submodule2 from './submodule2';

export default new Module('MyModule', {
  component: Component,
  submodules: [
    submodule1,
    submodule2
  ]
});
```

Each module will automatically include its submodule's reducers and introduce the submodules to the navigator.

### Navigation

```js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';
import otherMoudle from '../otherModule';

export default new Module('MyModule', {
  component: MainComponent,
  path: '/coolpath',
  effects: {
    goSomewhere: ({dispatch}) => dispatch(otherModule.actions.navigate()),
    receiveNavigation: () => doSomething() 
  }
});
```

In order to be navigable a module must provide a react component and a path (url fragment). When the browser url matches the given path the module's component will be rendered and the receiveNavigation action will be dispatched if there is one.

Each module automatically gets a `navigate` action which tells the navigator to focus that module. You can use this to navigate programatically, the browser url will be updated.

A module's path is used as the path prefix for all submodules recursively. A module's component is also used as the layout for all submodules components recursively. Submodule components are passed into parent module components using the `children` react prop.

If a parent module is behaving as a layout and doesn't have content of its own you'll want to provide `navigable: false` to prevent it from being rendered if none of the submodules match. 

### Interactions between modules

```js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';
import otherMoudle from '../otherModule';

export default new Module('MyModule', {
  effects: {
    goSomewhere: ({dispatch}) => dispatch(otherModule.actions.navigate()),
    saySomething: ({state}) => alert(otherModule.selectors.getSomething(state, 'arg'))
  }
});
```

If you import a module instance, you can access properties like `actions` and `selectors`. However these will not be pre-bound to dispatch or the redux state, so you'll need to make sure you have access to those already.

### Bootstrapping

```js
import {createAppContainer, Module} from 'react-redux-modules';
import module1 from './module1';
import module2 from './module2';

const app = new Module('App', {
  root: true, // tells rrm to initialize everything
  submodules: [
    module1,
    module2,
  ]
});

const {container} = createAppContainer(app, {
  initialState: window.__PRELOADED_STATE__,              // for state from server, optional, default {}
  enableDevtools: process.env.NODE_ENV === 'development' // enable devtools, optional, defalt false
});

// for expo
export default container;

// for web
ReactDOM.render(React.createElement(Container), document.getElementById('root'));
```

`createAppContainer` inspects your module tree and generates a redux store, redux
reducers, routing, sets up the required provider components for you, and returns that.

### State Consumption Helpers
- `module`: the module instance
- `selectors`: selectors this module has defined, pre-loaded with the state.
- `state`: the root redux state
- `localState`: the local redux state for this module
- `getState`: getter for root redux state (in case it changes over the course of whatever you're doing)
- `getLocalState`:  getter for local redux state (in case it changes over the course of whatever you're doing)

These helpers are all passed to selectors and effects.

Components get passed everything except `getState` and `getLocalState`.

Reducers only receive `module` and `localState`.

### State Modification Helpers
- `actions`: module actions, bound to dispatch
- `dispatch`: for dispatching actions from other modules
