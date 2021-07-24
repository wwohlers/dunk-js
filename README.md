# Dunk.js
Dunk.js is a scalable, TypeScript-first state management framework built on Redux. It follows a strongly opinionated design pattern inspired by the ducks design pattern and redux-thunk. Like Redux, Dunk.js is agnostic to environment and use case; it exposes essentially the same interface as Redux.

## Design Philosophy
The first priority in the design of Dunk.js was not only TypeScript support but an efficient use of types to maximize type safety. Of course, Dunk.js can be used in a Javascript project to provide helpful tooling, but the most significant benefits come with TypeScript use.

Dunk.js was designed to address many of the shortcomings of Redux (when used by itself). Namely:

 - It has no obvious architecture or design patterns
 - It is difficult to scale
 - It obfuscates the distinction between implementation (e.g. reducer functions) and interface (e.g. action creators and selectors)
 - Even when used with TypeScript, it offers no type safety between action creators, actions, and reducers

The next section will explain at a high level how Dunk.js improves upon all of these shortcomings.

## High-level overview
Dunk.js uses redux and redux-thunk under the hood. Its design pattern is loosely inspired by the ducks design pattern for Redux.

### Modules
A Dunk store is composed of a tree of modules. Each module contains its own state, reducer, actions, action creators, selectors, and thunks. This is analogous to what might be considered a "slice" in Redux.

Dunk stores gain their impressive scalability largely because of the composability of Dunk modules, which can be nested infinitely deep. This allows you to organize your store exactly how you'd like. If you're using Dunk.js with React, for example, you may want to organize your modules to match the structure of your components.

Modules yield a `composedReducer` and a `DunkInterfacePiece`.  

### Composed Reducers
The composed reducer is a reducer that can handle all the actions of that module as well as all the actions of the child modules. Internally, `composedReducer`s contain the initial state, reducers for that module's actions, and all the `composedReducer`s of the module's children. 

Reducers are composed all the way up to the root module, whose `composedReducer` is provided to `createDunkStore` to create a Dunk store. When actions are dispatched to a Dunk store, the store will direct the action to the module that is capable of processing it. (Each module knows the actions that it and its children are capable of processing.)

### Interface Pieces
The `DunkInterfacePiece` is an object that holds the module's action creators, selectors, thunks, and the interface pieces of its children.  

Like composed reducers, interface pieces are composed up to the root interface piece, which is fed to `createDunkInterface` to create an interface for the entire store. 

Code that is external to the store (i.e., a React component) should only ever need to use the interface to dispatch actions and thunks and use its selectors. This provides a clear separation of interface and implementation, which minimizes name collisions and improves code readability.

## Creating your first module
Modules contain three files: `types.ts`, `reducer.ts`, and `index.ts`. You should create and complete the files in this order. 

We'll begin with types. In your directory for your store, create a file named `types.ts`. This file will contain the types necessary for creating a Dunk module with maximum type safety.

We'll begin by defining the type of the module's state. For demonstration purposes, we'll make a simple store that increments a counter.

```
type RootState = {
	counter: number;
}
```

Next, let's enumerate the names (types) of actions that this module can process. Note that these names must be strings that are unique among all the modules in the store; we recommend following the convention for naming directories and files in a filesystem (where directories are analogous to modules and files to action names). You should export this enum.

```
export enum RootActions {
	SET_COUNTER = "set-counter",
	INC_COUNTER = "inc-counter",
	RESET_COUNTER = "reset-counter"
}
```

Next, we'll define a type that specifies the payload of each action type. This helps us guarantee type safety between action creators and reducers. Dunk.js provides a utility type, `DunkActionPayloads`, to simplify this definition. Here's an example:
```
type RootActionPayloads = DunkActionPayloads<RootActions, {
	[RootActions.SET_COUNTER]: number;
	[RootActions.INC_COUNTER]: undefined;
	[RootActions.RESET_COUNTER]: undefined;
}>
```

The first type parameter passed to `DunkActionPayloads` is the enum of action names. The second is an interface type that maps each item in this enum to the type of that action's payload. For example, the payload of the `RootActions.SET_COUNTER` action will be a `number`; the payload of `RootActions.INC_COUNTER` is undefined -- i.e., there is no payload.

Finally, we'll combine these three types to create a type for the entire module. Again, Dunk.js provides the utility type `DunkModule` that takes three generic type parameters: one for the state, one for the action names, and one for the action payloads.
```
export type RootModule = DunkModule<RootState, RootActions, RootActionPayloads>;
```
That's it for types.

### reducer.js
The reducer contains the initial state of the module and reducer functions capable of processing each of the module's actions. 

Dunk.js provides the `composeReducers` function to help you create a reducer with type safety. It takes one generic type parameter -- the module's `DunkModule` type that we just created. The first argument is the initial state of the module. The second argument specifies reducers for each of the module's actions. 
```
export const rootReducer = composeReducers<RootModule>({
	counter: 0
}, {
	[RootActions.SET_COUNTER]: (state, payload) => {
		return { ...state, counter: payload };
	},
	[RootActions.INC_COUNTER]: (state) => {
		return { ...state, counter: state.counter + 1 };
	},
	[RootActions.RESET_COUNTER]: (state) => {
		return { ...state, counter: 0 };
	}
});
```

Because `RootModule` contains information about the payload types of each action, `composeReducers` will guarantee type safety for your action reducers. Thus, we don't need to specify types for the `state` and `payload` arguments.

Be sure to export the reducer that is returned by `composeReducers`.

### index.js
The index file declares the interface of the module. The interface contains action creators and selectors, and specifies the interfaces of the module's children. The interface for a single module is called an interface piece, and typed as a `DunkInterfacePiece`.

Dunk.js provides the `DunkInterfaceCreator` utility class to help you define a type-safe interface for a module. To begin, initialize this class by specifying two type parameters: the `DunkModule` of this module and the type of the root state, `RootState` (this is used to type the `getState` argument when defining action creators). Optionally, you can pass in a third type parameter to specify the type of extra arguments for action creators, if you pass any to the `thunk` middleware.
```
const creator = new DunkInterfaceCreator<RootModule, RootState>();
```

First, we'll specify selectors. Selectors allow clients of the interface to access the state of the store. We can use `DunkInterfaceCreator.defineSelector()` to create a selector.
```
const getCounter = creator.defineSelector(() => state => state.counter);
const getDoubledCounter = creator.defineSelector(() => state => state.counter * 2);
```

To improve the developer experience, selectors specified for `createSelectors` take the module's state -- not the root state  -- as an argument (though in this particular case, the two happen to be the same since we are creating the root module). When the root interface is finally created -- and only then -- these selectors will be converted to selectors that take the root state as an argument so that they can be used on `getState()` (for example, for use with react-redux's `useSelector` hook). In addition, a `root` selector will be created that selects the root state of the module, i.e., the exact of the entire module, NOT the root state of the entire store (though, again, these two are the same in this case).

Next, we'll define action creators. Action creators are any functions that return actions or thunk actions that can be processed by this module. We can use `DunkInterfaceCreator.defineActionCreator()` for type inference and additional type-safety, even though these functions are technically just identity functions that return the action creator exactly as passed.

We'll start by defining simple action creators that just return actions.
```
const setCounter = creator.defineActionCreator((value: number) => ({
	type: RootActions.SET_COUNTER,
	payload: value
}));

const incCounter = creator.defineActionCreator(() => ({
	type: RootActions.INC_COUNTER
}));

const resetCounter = creator.defineActionCreator(() => ({
	type: RootActions.RESET_COUNTER
}));
```

Finally, we'll define action creators that return thunks. Thunks are functions that return `ThunkAction`s, which are like normal actions but can themselves dispatch further actions. Thunks are particularly useful for asynchronous operations. The below example shows how to increase the counter on an interval (without using the `INC_COUNTER` action).
```
countInterval = creator.defineActionCreator((interval: number) => {
	return (dispatch, getState) => {
		setInterval(() => {
			const oldCounterValue = getState().counter;
			dispatch(setCounter(oldCounterValue + 1));
		}, interval);
	}
});
```

Notice how we can dispatch other action creators that we've already defined from inside the action creator. This makes it easy to create increasingly complex action creators while reducing code duplication.

The only remaining step is to put everything together to create an interface piece for this module. To do this, we'll call `creator.createInterfacePiece()`, passing in an argument that specifies its action creators and selectors.
```
export const RootInterface = creator.createInterfacePiece({
	selectors: {
		getCounter,
		getDoubledCounter
	},
	actionCreators: {
		setCounter,
		incCounter,
		resetCounter,
		countInterval
	}
});
```

## Creating a Dunk store
Now that we've created our first module, we can create a simple store with it as our root module. Dunk.js makes this incredibly easy.

First, we'll create the actual store (which we would supply to a `Provider`, if we were using react-redux). Dunk.js provides the `createDunkStore` utility function as a wrapper to Redux's `createStore`.
```
const store = createDunkStore(rootReducer);
```
Next, we'll create the store's interface. To do this, we can use the `createDunkInterface` utility function, and pass in just the interface of the root module. 
```
const Store = createDunkInterface(RootInterface);
```

We can now use this interface to dispatch actions and use selectors, like this:
```
store.dispatch(Store.actions.resetCounter());
const counter = Store.selectors.getCounter()(store.getState());
```
Note that the type of the store's `dispatch` function is slightly different from both redux's default `dispatch` type as well as redux-thunk's `dispatch` type. If you need to specify the type of `dispatch` (for example when using react-redux's`useSelector`), use `typeof store.dispatch`.

## Nesting modules
The impressive scalability of a Dunk store lies in the composability of its modules. By nesting modules, you can organize your data store in exactly the way you want, ensuring separation of concerns and a clean directory structure. Let's now look at how Dunk makes it easy to compose modules.

Continuing from our earlier example, imagine we wanted to create a child module called Settings. Begin by creating a directory inside of the root store folder called `settings`. Thus, your final directory structure will look something like this:
```
- store
	- index.ts
	- reducer.ts
	- types.ts
	- settings
		- index.ts
		- reducer.ts
		- types.ts
```

Begin with `types.ts`:
```
type SettingsState = {
	incrementStep: number;
	autoReset: number | undefined;
}

export enum SettingsActions {
	SET_INC_STEP = "settings/set-inc-step",
	SET_AUTO_RESET = "setttings/set-auto-reset"
}

type SettingsActionPayloads = DunkActionPayloads<SettingsActions, {
	[SettingsActions.SET_INC_STEP]: number,
	[SettingsActions.SET_AUTO_RESET]: number | undefined
}>

export type SettingsModule = DunkModule<SettingsState, SettingsActions, SettingsActionPayloads>;
```

(Note the naming convention for actions.)

Next, `reducer.ts`:
```
export const settingsReducer = composeReducers<SettingsModule>({
	incrementStep: 1,
	autoReset: undefined,
}, {
	[SettingsActions.SET_INC_STEP]: (state, payload) => {
		return { ...state, incrementStep: payload };
	},
	[SettingsActions.SET_AUTO_RESET]: (state, payload) => {
		return { ...state, autoReset: payload };
	}
});
```

Finally, `index.ts`:
```
const creator = new DunkInterfaceCreator<SettingsModule, RootState>();

const setIncStep = creator.defineActionCreator((value: number) => ({
	type: SettingsActions.SET_INC_STEP,
	payload: value
}));

const setAutoReset = creator.defineActionCreator((value: number | undefined) => ({
	type: SettingsActions.SET_AUTO_RESET,
	payload: value,
}));

export const SettingsInterface = creator.createInterfacePiece({
	actionCreators: {
		setIncStep,
		setAutoReset
	}
});
```
We can omit selectors if they aren't necessary for a module. The module's interface will still expose a `root` selector.

Now that we've completed our submodule, we're ready to integrate it into the store by adding it as a child module of the `RootModule`.

The first step is to update `RootState` to include a new property for the `SettingsModule`. Even though this is a type for the module's state, specify the child's `DunkModule` rather than the its actual state type:
```
type RootState = {
	counter: number;
	Settings: SettingsModule;
}
```
Always capitalize the names of properties that specify child modules to avoid naming collisions.

Next, we'll have to update our root reducer. `composeReducers` makes it trivial to -- as you may have guessed -- compose reducers. Here's our updated `reducer.ts`:
```
export const rootReducer = composeReducers<RootModule>({
	counter: 0,
	Settings: settingsReducer
}, {
	[RootActions.SET_COUNTER]: (state, payload) => {
		return { ...state, counter: payload };
	},
	[RootActions.INC_COUNTER]: (state) => {
		return { ...state, counter: state.counter + 1 };
	},
	[RootActions.RESET_COUNTER]: (state) => {
		return { ...state, counter: 0 };
	}
});
```
That's it.

Finally, we'll update our interface, where the necessary changes are similarly trivial:
```
export const RootInterface = creator.createInterfacePiece({
	selectors: {
		getCounter,
		getDoubledCounter
	},
	actionCreators: {
		setCounter,
		incCounter,
		resetCounter,
		countInterval
	}
}, {
	Settings: SettingsInterface
})
```

That's it. We can now easily access the actions, selectors, and thunks of the Settings module through the interface (the `Store` variable we exported from this same file). For example, if we want to update `incrementStep`:

`store.dispatch(Store.Settings.actions.setIncStep(5));`

To actually use the `incrementStep` in our root module, we might change our `RootActions.INC_COUNTER` reducer to look like this:
```
[RootActions.INC_COUNTER]: (state, payload) => {
	return { ...state, counter: state.counter + state.Settings.incrementStep };
}
```

## API
### Types
#### DunkActionPayloads<A, T>
Used to specify the types of each action named in `A` (a string `enum` of action names). `T` is an interface which maps every action name to the type of that action. For example, we might have the following actions:
```
enum Actions = {
	SET_STRING = "set-string",
	SET_NUMBER = "set-number",
}
```

We can use `DunkActionPayloads` to specify the types of these actions:
```
type ActionPayloads = DunkActionPayloads<Actions, {
	[Actions.SET_STRING]: string,
	[Actions.SET_NUMBER]: number
}>
```

#### DunkModule<L, A, M>
A type that bundles types for `L` (the local state of the module), `A` (a string `enum` of action names), and `M` (a `DunkActionPayloads` of `A`). Used for other functions, classes, and types in the `Dunk` library.

Note that type parameters `A` and `M` are optional and should be provided if and only if the module has any actions.

For example, we might have the following state, actions, and action payloads types:
```
type State = {
	str: string;
	num: number;
}

enum Actions = {
	SET_STRING = "set-string",
	SET_NUMBER = "set-number",
}

type ActionPayloads = DunkActionPayloads<Actions, {
	[Actions.SET_STRING]: string,
	[Actions.SET_NUMBER]: number
}>
```

We can bundle these types like this:
`type Module = DunkActionModule<State, Actions, ActionPayloads>;`

#### UndunkedState<S\>
A utility type that extracts the actual type of the state from `S`, a `DunkState`. A `DunkState` (used to specify the type of a Dunk module's state) asks for a `DunkModule` for child modules rather than the actual state of that child. `UndunkedState` selects the state from all `DunkModules` in the state tree, thereby returning the true type of the module's state. You generally won't need to use this, but it may come handy when you need to know the actual shape of a `DunkState`.

For example, let's say we had a state like this:
```
type ModuleState = {
	Child: ChildModule;
}
````
Because `Child` is a `ChildModule` which extends `DunkModule` -- and not `DunkState` -- using the `ModuleState` type directly will lead to incorrect types. To fix this, rather than referring to `ModuleState`, refer to `UndunkedState<ModuleState>`, which will extract the state type of every `DunkModule` in the state tree.

### Functions
#### composeReducers<D\>(initialState, rootReducers)
Creates a `ComposedDunkReducer` for a `DunkModule` `D`, from an initial state and a map of action reducers. This composed reducer can be used as a reducer for `composeReducers` when called by parents, or as a root reducer when provided to `createDunkStore`.

The first parameter, `initialState`, should specify the initial state of the module. For child modules, provide the module's reducer. For example, for a module with this state:
```
type ModuleState = {
	counter: number;
	Settings: SettingsModule;
}
```
Provide an initial state like this:
```
{
	counter: 0,
	Settings: settingsReducer
}
```

The second parameter, `rootReducers`, is optional and takes a map of action names to reducer functions that can process each of those action names. The action names are derived from the `DunkModule` that is provided to the function. Thus, for a module with the following action and action payload types:
```
enum Actions = {
	SET_STRING = "set-string",
	SET_NUMBER = "set-number",
}

type ActionPayloads = DunkActionPayloads<Actions, {
	[Actions.SET_STRING]: string,
	[Actions.SET_NUMBER]: number
}>
```

The second parameter to `composeReducers` should look like this:
```
{
	[Actions.SET_STRING]: (state, payload) => {
		return state; // or any object of the same type 
	},
	[Actions.SET_NUMBER]: (state, payload) +> {
		return state;
	}
}
```

#### createDunkInterface(rootInterfacePiece)
Creates an interface for a Dunk store given the interface piece of the root module. "Completing" an interface (instead of just using the root interface piece as the store's interface) is necessary to make selectors work correctly.

For example, to create an interface for a store, we'll first create an interface for its root module:
```
const creator = new DunkInterfaceCreator<RootModule, RootState>();

// ...

export const RootInterface = creator.createInterfacePiece({});
```

Then, we pass this interface piece to `createDunkInterface` to create the final interface of the store:
```
export const StoreInterface = createDunkInterface(RootInterface);
```

#### createDunkStore(rootReducer, initialState, extraArguments, otherMiddleware)
Creates a Dunk store given the root reducer of the store, and three optional arguments: 

- **initialState** -- the initial state of the store. If undefined, the initial state is derived from the `intialState` provided to `composeReducers`. This is useful for loading state from an external source
- **extraArguments** -- extra arguments to provide to the thunk middleware. See [here](https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument) for more info.
- **otherMiddleware** -- other middleware for the Redux store, exactly how you would provide it to redux's `createStore` function. As the name suggests, you do not need to provide `thunk` here; Dunk takes care of this for you.

Returns a store object with essentially the same API as redux's `createStore`. Thus, this object can be used for, say, react-redux's `Provider` component.


### Classes
#### DunkInterfaceCreator<D, G, E>
A class that exposes methods for building a Dunk interface piece for a `DunkModule` `D` and for a store whose root state is `G` (used for the `getState` argument for thunks). Optionally, you can provide a third type for the `extraArguments` argument for thunks. This third type should match the type that you provide to the `extraArguments` parameter of `createDunkStore`, and defaults to `undefined`. 

The constructor takes no arguments and instances of this class have no state. The purpose of this class is to simplify the interface. It has three public methods:

**defineActionCreator(actionCreator)** 
Used to define an action creator, a function that returns an action or thunk action that this module can process. Returns `actionCreator`, exactly as passed. See [here](https://github.com/reduxjs/redux-thunk) for more info about thunks.

**defineSelector(selector)**
Used to define a selector, a function that takes any arguments and returns a selector, a function
 that takes the module's state as a parameter and returns anything. 

**createInterfacePiece(dunk, children)** 
Used to create an interface piece for the module. `dunk` is an object with two optional properties: `actionCreators` (which takes an object map of action creators) and `selectors` (which takes an object map of selectors). If the module has children, you should also pass in `children`, an object that specifies the interfaces of the module's children.
