import { ThunkAction } from 'redux-thunk';
import {
  DunkAction,
  DunkActionPayloads,
  DunkModule,
  ExtractActionMap,
  ExtractActions,
  ExtractLocalState,
  UndunkedState,
} from './index';

type Selector<S, R> = (state: S) => R;

type ObjectOf<T> = { [key: string]: T };

/**
 * A interface piece created for a DunkModule.
 */
export type DunkInterfacePiece<
  GLOBAL,
  LOCAL,
  MAP extends DunkActionPayloads<ACTIONS, any>,
  ACTIONS extends string,
  CREATORS extends DunkActionCreators<MAP>,
  SELECTORS extends IncompleteDunkSelectors<LOCAL>,
  THUNKS extends DunkThunks<GLOBAL, any>,
  CHILDREN extends IncompleteDunkChildren<GLOBAL, LOCAL>,
> = {
  actions: CREATORS;
  selectors: SELECTORS;
  thunks: THUNKS;
  children: CHILDREN;
};

/**
 * A complete Dunk Interface.
 */
export type CompletedDunkInterface<
  GLOBAL,
  LOCAL,
  MAP extends DunkActionPayloads<ACTIONS, any>,
  ACTIONS extends string,
  CREATORS extends DunkActionCreators<MAP>,
  SELECTORS extends IncompleteDunkSelectors<LOCAL>,
  THUNKS extends DunkThunks<GLOBAL, any>,
  CHILDREN extends IncompleteDunkChildren<GLOBAL, LOCAL>,
> = {
  actions: CREATORS;
  selectors: CompletedDunkSelectors<GLOBAL, LOCAL, SELECTORS>;
  thunks: THUNKS;
} & CompletedDunkChildren<CHILDREN>;

/**
 * A function that creates a DunkAction.
 */
export type ActionCreator<A extends string, P> = (...args: any[]) => DunkAction<A, P>;

// ACTIONS
/**
 * Type constraint for a DunkModule's Actions.
 */
type DunkActionCreators<
  M extends DunkActionPayloads<any, any>,
  K extends Extract<keyof M, string> = Extract<keyof M, string>,
> = {
  [key: string]: { [I in K]: ActionCreator<I, M[I]> }[K];
};

// Selectors
/**
 * Type constraint for an incomplete DunkModule's selectors.
 */
type IncompleteDunkSelectors<S> = ObjectOf<Selector<UndunkedState<S>, any>>;

/**
 * Type constraint for a complete DunkModule's selectors, including a root selector.
 */
type CompletedDunkSelectors<G, S, I extends IncompleteDunkSelectors<any>> = {
  root: Selector<UndunkedState<G>, UndunkedState<S>>;
} & {
  [K in keyof I]: Selector<UndunkedState<G>, ReturnType<I[K]>>;
};

// Thunks
/**
 * A thunk provided for a DunkModule.
 * @typeParam R the response type of the thunk
 * @typeParam G the type of the root state of the store
 * @typeParam E the type of any extraArguments provided to the store
 */
type DunkThunkAction<R, G, E> = ThunkAction<R, UndunkedState<G>, E, DunkAction<string, any>>;

/**
 * A dictionary of the DunkThunks in a DunkModule.
 */
type DunkThunks<G, E> = ObjectOf<(...args: any[]) => DunkThunkAction<any, G, E>>;

// Children
type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];
/**
 * Type constraint for child DunkModules of an incomplete DunkModule.
 * @typeParam G the root state of the DunkModule
 * @typeParam S the local state of the DunkModule
 */
type IncompleteDunkChildren<G, S> = {
  [K in KeysMatching<S, DunkModule<any, any, any>>]: S[K] extends DunkModule<any, any, any> ? DunkInterfacePiece<G, S[K], any, any, any, any, any, any> : never
}

/**
 * Type constraint for the child DunkModules of a complete DunkModule.
 * @typeParam I the type of the IncompleteDunkChildren
 */
type CompletedDunkChildren<I extends IncompleteDunkChildren<any, any>> = {
  [K in keyof I]: I[K] extends DunkInterfacePiece<
    infer G,
    infer S,
    infer M,
    infer N,
    infer A,
    infer E,
    infer T,
    infer C
  >
    ? CompletedDunkInterface<G, S, M, N, A, E, T, C>
    : never;
};

/**
 * A factory class for creating a DunkInterfacePiece and its actions, selectors. and thunks.
 * @typeParam D the DunkModule
 * @typeParam GLOBAL the root state of the Dunk store
 * @typeParam EXTRA extra arguments (used for thunks)
 */
export class DunkInterfaceCreator<D extends DunkModule<any, any, any>, GLOBAL, EXTRA = undefined> {
  /**
   * Define action creators for a Dunk interface.
   * @param actions a dictionary of arbitrary keys to ActionCreators, functions that take
   * arbitrary arguments and return an Action which can be dispatched to the store
   */
  public createActionCreators<CREATORS extends DunkActionCreators<ExtractActionMap<D>>>(actions: CREATORS): CREATORS {
    return actions;
  }

  /**
   * Define selectors for a Dunk interface.
   * @param selectors a dictionary of arbitrary keys to Selectors, functions that take the root
   * state as an argument and return the result of an arbitrary operation on that state
   */
  public createSelectors<SELECTORS extends IncompleteDunkSelectors<ExtractLocalState<D>>>(
    selectors: SELECTORS,
  ): SELECTORS {
    if (Object.keys(selectors).some(k => k === "root")) {
      throw new Error("Selectors cannot be named 'root'");
    }
    return selectors;
  }

  /**
   * Define thunks for a Dunk interface.
   * @param thunks a dictionary of arbitrary keys to DunkThunks, functions that take arbitrary
   * arguments and return DunkThunkActions, actions that the thunk middleware can process
   */
  public createThunks<THUNKS extends DunkThunks<GLOBAL, EXTRA>>(thunks: THUNKS): THUNKS {
    return thunks;
  }

  /**
   * Creates an interface piece for the DunkModule, which can be used to compose modules.
   * @param dunk the actions, selectors, and thunks of the DunkModule
   * @param children a dictionary of the interface pieces of this DunkModule's children
   */
  public createInterfacePiece<
    A extends DunkActionCreators<ExtractActionMap<D>>,
    E extends IncompleteDunkSelectors<ExtractLocalState<D>>,
    T extends DunkThunks<GLOBAL, EXTRA>,
    C extends IncompleteDunkChildren<GLOBAL, ExtractLocalState<D>>,
  >(
    dunk: {
      actions?: A;
      selectors?: E;
      thunks?: T;
    },
    children: C = {} as C,
  ): DunkInterfacePiece<GLOBAL, ExtractLocalState<D>, ExtractActionMap<D>, ExtractActions<D>, A, E, T, C> {
    const filledDunk: {
      actions: A;
      selectors: E;
      thunks: T;
    } = {
      actions: dunk.actions || ({} as A),
      selectors: dunk.selectors || ({} as E),
      thunks: dunk.thunks || ({} as T),
    };
    return {
      ...filledDunk,
      children,
    };
  }
}

/**
 * Creates a Dunk interface given a root interface piece.
 * @param rootInterfacePiece
 */
export const createDunkInterface = <
  GLOBAL,
  MAP extends DunkActionPayloads<ACTIONS, any>,
  ACTIONS extends string,
  CREATORS extends DunkActionCreators<MAP>,
  SELECTORS extends IncompleteDunkSelectors<GLOBAL>,
  THUNKS extends DunkThunks<GLOBAL, any>,
  CHILDREN extends IncompleteDunkChildren<GLOBAL, GLOBAL>,
>(
  rootInterfacePiece: DunkInterfacePiece<GLOBAL, GLOBAL, MAP, ACTIONS, CREATORS, SELECTORS, THUNKS, CHILDREN>,
): CompletedDunkInterface<GLOBAL, GLOBAL, MAP, ACTIONS, CREATORS, SELECTORS, THUNKS, CHILDREN> => {
  const invalidNames = ['actions', 'thunks', 'selectors'];
  if (Object.keys(rootInterfacePiece.children).some(k => invalidNames.includes(k))) {
    throw new Error(`Modules cannot be named ${invalidNames.map(n => `'${n}'`).join(' or ')}`);
  }
  return completeInterface((state: UndunkedState<GLOBAL>) => state, rootInterfacePiece);
};

/**
 * Completes a Dunk interface, given a root selector and an interface piece.
 * @param rootSelector
 * @param interfacePiece
 */
const completeInterface = <
  GLOBAL,
  LOCAL,
  MAP extends DunkActionPayloads<ACTIONS, any>,
  ACTIONS extends string,
  CREATORS extends DunkActionCreators<MAP>,
  SELECTORS extends IncompleteDunkSelectors<LOCAL>,
  THUNKS extends DunkThunks<GLOBAL, any>,
  CHILDREN extends IncompleteDunkChildren<GLOBAL, LOCAL>,
>(
  rootSelector: (state: UndunkedState<GLOBAL>) => UndunkedState<LOCAL>,
  interfacePiece: DunkInterfacePiece<GLOBAL, LOCAL, MAP, ACTIONS, CREATORS, SELECTORS, THUNKS, CHILDREN>,
): CompletedDunkInterface<GLOBAL, LOCAL, MAP, ACTIONS, CREATORS, SELECTORS, THUNKS, CHILDREN> => {
  const mappedSelectors = Object.fromEntries(
    Object.entries(interfacePiece.selectors).map(([key, value]) => {
      return [key, (state: UndunkedState<GLOBAL>) => value(rootSelector(state))];
    }),
  ) as Omit<CompletedDunkSelectors<GLOBAL, LOCAL, SELECTORS>, 'root'>;
  const selectors = {
    root: rootSelector,
    ...mappedSelectors,
  } as CompletedDunkSelectors<GLOBAL, LOCAL, SELECTORS>;

  const completedChildren = Object.fromEntries(
    Object.entries(interfacePiece.children).map(([key, value]: [string, any]) => {
      const typedChild: DunkInterfacePiece<GLOBAL, LOCAL[keyof LOCAL], any, any, any, any, any, any> = value;
      const newRootSelector = (state: UndunkedState<GLOBAL>) => {
        return rootSelector(state)[key as keyof LOCAL] as UndunkedState<LOCAL[keyof LOCAL]>;
      };
      const completedChild = completeInterface(newRootSelector, typedChild);
      return [key, completedChild];
    }),
  ) as CompletedDunkChildren<CHILDREN>;

  return {
    actions: interfacePiece.actions,
    thunks: interfacePiece.thunks,
    selectors,
    ...completedChildren,
  };
};
