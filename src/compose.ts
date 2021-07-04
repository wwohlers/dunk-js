import {
  AnyAction,
  applyMiddleware,
  createStore,
  Middleware,
  PreloadedState,
  Reducer,
  Store
} from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import {
  DunkAction,
  DunkActionPayloads,
  DunkModule,
  ExtractActionMap,
  ExtractLocalState,
  UndunkedState,
} from './index';

/**
 * A function that reduces a state by an Action.
 *
 * @typeParam S type of the state that is reduced
 * @typeParam A type of the action name (must extend string)
 */
type DunkReducer<S, A extends string> = (state: S, action: DunkAction<A, any>) => S;

/**
 * A function that reduces a state given a Payload.
 *
 * @typeParam S type of the state that is reduced
 * @typeParam P type of the Payload
 */
type SimpleReducer<S, P> = (state: S, payload: P) => S;

/**
 * An object that contains all internal data for a Dunk Module: the initial state of the module,
 * the actions which the module can process (including those of its children), and the
 * DunkReducer function.
 *
 * @typeParam S type of the state of this module
 * @typeParam A type of the action names that this module's root reducer can process
 */
type ComposedDunkReducer<S, A extends string> = {
  initialState: UndunkedState<S>;
  actions: string[];
  reducer: DunkReducer<UndunkedState<S>, A>;
};

/**
 * Map of simple reducers of a ComposedDunkReducer.
 */
type RootReducerMap<S, M extends DunkActionPayloads<any, any>> = {
  [K in keyof M]: SimpleReducer<UndunkedState<S>, M[K]>;
};

/**
 * The initial state of a DunkState. For DunkModules, rather than providing the initial state of
 * that module, you must provide its ComposedReducer.
 */
type ReducerChildren<S> = {
  [K in keyof S]: S[K] extends DunkModule<any, any, any> ? ComposedDunkReducer<ExtractLocalState<S[K]>, any> : S[K];
};

/**
 * Selects just the children of a ComposedReducer which are themselves ComposedReducers.
 */
type ReducerChildrenModulesOnly<S> = {
  [K in keyof S]: S[K] extends DunkModule<any, any, any> ? ComposedDunkReducer<ExtractLocalState<S[K]>, any> : never;
};

/**
 * Returns whether an object is a composed reducer (rather than an object in a state).
 * @param value
 */
const isComposedReducer = (value: any): boolean => {
  return (
    !!value &&
    value.hasOwnProperty('initialState') &&
    value.hasOwnProperty('reducer') &&
    typeof value['reducer'] === 'function'
  );
};

/**
 * Creates a ComposedDunkReducer that combines reducers for root state and child reducers.
 * @param initialState the initial state of the reducer. For DunkModules, provide a
 * ComposedReducer rather than the initial state of the module
 * @param rootReducers reducers for root actions
 */
export const composeReducers = <D extends DunkModule<any, any, any>>(
  initialState: ReducerChildren<ExtractLocalState<D>>,
  rootReducers?: RootReducerMap<ExtractLocalState<D>, ExtractActionMap<D>>,
): ComposedDunkReducer<ExtractLocalState<D>, string> => {
  type S = ExtractLocalState<D>;
  type M = ExtractActionMap<D>;

  const childReducers = Object.fromEntries(
    Object.entries(initialState).filter(([, value]) => isComposedReducer(value)),
  ) as ReducerChildrenModulesOnly<S>;

  const reducer = (state: UndunkedState<S>, action: DunkAction<string, any>) => {
    const reducer = rootReducers && (rootReducers[action.type as keyof M] as SimpleReducer<UndunkedState<S>, M[keyof M]> | undefined);
    if (reducer) {
      if ('payload' in action) {
        return reducer(state, action.payload);
      } else {
        return reducer(state, undefined);
      }
    }
    for (const key in childReducers) {
      const child = childReducers[key]!;
      if (child.actions.includes(action.type)) {
        return {
          ...state,
          [key]: child.reducer(state[key] as UndunkedState<ExtractLocalState<D>[string]>, action),
        };
      }
    }
    return state;
  };

  const childKeys = !childReducers
    ? []
    : Object.values(childReducers).reduce((acc: string[], value: any) => {
        const typedChild: ComposedDunkReducer<any, any> = value;
        return [...acc, ...typedChild.actions];
      }, [] as string[]);
  const actions = [...(rootReducers ? Object.keys(rootReducers) : []), ...childKeys];

  const trueInitialState = Object.fromEntries(
    Object.entries(initialState).map(([key, value]) => {
      if (isComposedReducer(value)) {
        return [key, (value as ComposedDunkReducer<any, any>)['initialState']];
      } else {
        return [key, value];
      }
    }),
  ) as S;

  return {
    initialState: trueInitialState,
    actions,
    reducer,
  };
};

/**
 * Creates a Dunk store.
 * @param rootReducer the ComposedReducer of the root module
 * @param initialState the initial state of the store, if it differs from the initial state
 * provided by the reducers
 * @param extraArguments extra arguments for the thunk middleware
 * @param otherMiddleware other Redux middleware to apply to the store
 */
export const createDunkStore = <S>(
  rootReducer: ComposedDunkReducer<S, string>,
  initialState?: UndunkedState<S>,
  extraArguments?: any,
  otherMiddleware?: Middleware<any, {}, any>[],
): Store<UndunkedState<S>> & { dispatch: ThunkDispatch<UndunkedState<S>, any, AnyAction> } => {
  const finalInitialState = initialState || rootReducer.initialState;
  const finalReducer: Reducer<UndunkedState<S>> = (
    state: UndunkedState<S> | undefined,
    action: DunkAction<any, any>,
  ) => {
    return state ? rootReducer.reducer(state, action) : finalInitialState;
  };
  return createStore(
    finalReducer,
    finalInitialState as PreloadedState<UndunkedState<S>>,
    applyMiddleware(
      extraArguments ? thunk.withExtraArgument(extraArguments) : thunk,
      ...(otherMiddleware || [])
    ),
  );
};
