# react-redux-modules as a way to organize react-redux

## Modules

```js
import {Module} from 'react-redux-modules';

export default new Module('MyModule');
```

A module ties together the components of a react-redux module. The reducer, actions, side effects, and react component
are all covered by module configurations.

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
import {connect} from 'react-redux-modules'; 
import module from './module';

function MainComponent() {
  return <h1>Hello World</h1>;
}

export default connect(() => module, MainComponent);
```

The `component` property of a module is the component that is rendered when this module is navigated to. The
component is not connected to the redux state by default, use the `connect` function to connect this (or any)
component to the module state. By default `connect` binds the entire module state subtree, plus dispatchers
for all module actions. The props bound from the state can be overriden by providing a static
`mapStateToProps(localState, state, ownProps)` on the component. Note that the first argument is the module
state subtree, you can use this to not care about where this module falls in the application structure if its
irrelevant to you. Sometimes accessing state outside of your module is necessary, like getting the currently
logged in user, for this reason the complete state tree is also provided.

### Reducers

```js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';
import {set} from 'lodash/fp';

export default new Module('MyModule', {
  component: MainComponent,
  initialState: {},
  reducers: {
    onCount: (state, payload) => set('counter', state.counter + 1, state)
  }
});
```

Reducers are defined as a map of action names to reducer functions, the module combines these with any submodule
reducers and builds the whole thing for you. `initialState` is optional and is empty by default.

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
and can be used for whatever side effects you want, async, whatever. For your pleasure these things are 
passed as an object to the effect function: `{state, localState, action, payload, dispatch, actions}` where `actions`
is a map of action dispatchers for each action in this module. The actions passed into the effect are already wrapped with dispatch. The actual `dispatch` function is also passed in case you need to dispatch an action from another module.

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

### Actions

Any action referenced in either the reducer or effect configs (doesn't have to be in both) gets an automatically generated
action creator in `module.actions`. If a component is connected all module actions are bound to its props by
default, so calling `this.props.actionName()` will dispatch the action `actionName`. If you want to dispatch an action
from a different module, you can, but you have to import the module and call dispatch explicitly: 
`this.props.dispatch(otherModule.actions.actionName())`. Any arguments that are passed to the action creator end up in the 
`payload` of the action by the time it gets to the reducers and effects.

### Navigation

```js
import {Module} from 'react-redux-modules';
import MainComponent from './MainComponent';
import otherMoudle from '../otherModule';

export default new Module('MyModule', {
  component: MainComponent,
  navigationOptions: {
    title: 'Home',
  },
  effects: {
    goSomewhere: ({dispatch}) => dispatch(otherModule.actions.navigate())  
  }
});
```

Each module automatically gets a `navigate` action which tells the navigator to focus that module. Internally navigation
is handled by [react navigation](https://reactnavigation.org/) and there is a there is a `navigationOptions` configuration
which gets mapped to [this](https://reactnavigation.org/docs/navigators/navigation-options) for configuring the navigator.

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

Submodules are mostly a way to not have one giant list of modules in your `App.js`, each module will automatically
include its submodule's reducers and introduce the submodules to the navigator.

## Bootstrapping

```js
import {createAppContainer, Module} from 'react-redux-modules';
import module1 from './module1';
import module2 from './module2';

const app = new Module('App', {
  submodules: [
    module1,
    module2,
  ]
});

// for expo
return createAppContainer(app);

// for web
const container = createAppContainer(app);
ReactDOM.render(React.createElement(Container), document.getElementById('root'));
```

`createAppContainer` inspects your module tree and generates a redux store, redux
reducers, navigation router, sets up the required redux and navigation react components for you, and returns that.




# below this is just ideas


## mixin example (pagination)

```js
// - /mixins/Pagination/index.js
import {Mixin} from 'react-redux-modules';
import {set} from 'lodash/fp';

export default class Pagination extends Mixin {
  initialState = {
    data: {},
    selected: [],
    currentPage: 0,
    totalPages: 0,
  };
  
  reducers = {
    setPage: (state, {page}) => set('page', page, state),
    receivePage: (state, {results}) => set('selected', results, state) // pretend this puts ids in selected and data in data
  };
  
  effects = {
    setPage: body => this.loadPageEffect(body),
  };
  
  loadPageEffect = ({payload, dispatch, actions}) => {
    // do something, potentially with some extra arguments
    // passed into the module constructor, to get the results
    dispatch(actions.receivePage({results}));
  };
}
```

the idea is that the mixin would not represent any new state or anything, but its initialState, reducers and effects would
be merged onto the module's. this would allow default functionality in the mixin while easily allowing you to override it 
from the module by specifying a reducer or effect with the same name. The mixin could define components, which would just
be connected to the module wherever they're used.

```js
// - /UserList/module.js
import {Module} from 'react-redux-modules';
import Pagination from '../mixins/Pagination';
import ListComponent from './ListComponent';
import UserRow from './UserRow';

export default new Module('UserList', {
  component: Component,
  mixins: [
    new Pagination(/* probably some extra stuff */)
  ]
});
```

```js
// - /UserList/Component.js
import React from 'react';
import {connect} from 'react-redux-modules';
import PageLinks from '../mixins/Pagination/PageLinks';
import ListComponent from './ListComponent';
import module from './module';

const ConnectedPageLinks = connect(() => module, PageLinks);

export default function UserList() {
  return <div>
    <ListComponent />
    <ConnectedPageLinks />
  </div>
}
```

```js
// - /UserList/ListComponent.js
import React, {Component} from 'react';
import {connect} from 'react-redux-modules';
import UserRow from './UserRow';
import module from './module';

class ListComponent extends Component {
  static mapStateToProps(localState) {
    return {
      users: localState.selected;
    };
  }
  
  render() {
    const {users} = this.props;
    return <ul>
      {users.map(user => <UserRow key={user} id={user} />)}
    </ul>
  }
}

export default connect(() => module, ListComponent);
```

```js
// - /UserList/UserRow.js
import React, {Component} from 'react';
import {connect} from 'react-redux-modules';
import module from './module';

class UserRow extends Component {
  static mapStateToProps(localState, state, ownProps) {
    return {
      user: localState.data[ownProps.id];
    };
  }
  
  render() {
    const {user} = this.props;
    return <li>{user.name}</li>;
  }
}

export default connect(() => module, UserRow);
```
