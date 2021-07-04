import {createDunkInterface, DunkInterfaceCreator} from './interface';
import {composeReducers, createDunkStore} from './compose';

export type DunkState = {
  [K: string]: any;
};

/**
 * Utility type that returns the actual state type of a DunkState by recursively selecting the state
 * from all modules.
 */
export type UndunkedState<S> = {
  [K in keyof S]: S[K] extends DunkModule<infer L, any, any> ? UndunkedState<L> : S[K];
};

/**
 * An action that can be dispatched to a Dunk store.
 * @typeParam T the action's type (must be a string that is unique to the store)
 * @typeParam P the payload of the action
 */
export type DunkAction<T extends string, P> = P extends undefined
  ? {
      type: T;
    }
  : {
      type: T;
      payload: P;
    };

/**
 * A type that specifies the payload types of actions.
 * @typeParam A enumeration of action types whose payloads will be specified
 * @typeParam T the type that lists the payload type of all action types
 */
export type DunkActionPayloads<
  A extends string,
  T extends {
    [K in A]: any;
  },
> = T;

/**
 * A composable module of a Dunk Store, containing a state and a reducer.
 * @typeParam L the type of this module's state
 * @typeParam A enumeration of this module's root action types
 * @typeParam M the map of the payloads of this module's actions
 */
export type DunkModule<L extends DunkState, A extends string = any, M extends DunkActionPayloads<A, any> = {}> = {
  localState: L;
  actions: A;
  actionMap: M;
};

export type ExtractLocalState<D extends DunkModule<any, any, any>> = D extends DunkModule<infer L, any, any>
  ? L
  : never;

export type ExtractActions<D extends DunkModule<any, any, any>> = D extends DunkModule<any, infer A, any> ? A : never;

export type ExtractActionMap<D extends DunkModule<any, any, any>> = D extends DunkModule<any, any, infer M> ? M : never;

export { DunkInterfaceCreator, createDunkInterface, composeReducers, createDunkStore };
