import {
  createDunkInterface,
  DunkInterfaceCreator,
  Selector,
} from '../../interface';
import { ExtraArgs, RootActions, RootModule, RootState } from './types';
import { AuthInterface } from './auth';
import { TodoInterface } from './todos';
import { rootReducer } from './reducer';
import { Api } from './api';
import { createDunkStore } from '../../compose';
import { UndunkedState } from '../../index';

const face = new DunkInterfaceCreator<RootModule, RootState, ExtraArgs>();

const getSettings = face.defineSelector(() => (state) => state.settings);

const setIsBrowser = face.defineActionCreator((value: boolean) => ({
  type: RootActions.SET_IS_BROWSER,
  payload: value,
}));

const setTheme = face.defineActionCreator(
  (value: RootState['settings']['theme']) => ({
    type: RootActions.SET_THEME,
    payload: value,
  }),
);

const RootInterface = face.createInterfacePiece(
  {
    actionCreators: {
      setIsBrowser,
      setTheme,
    },
    selectors: {
      getSettings,
    },
  },
  {
    Auth: AuthInterface,
    Todos: TodoInterface,
  },
);

export const Store = createDunkInterface(RootInterface);

export const initStore = () => {
  const store = createDunkStore(rootReducer, undefined, { api: Api });
  type ExtractReturnType<A = Selector<any, any>> = A extends Selector<
    any,
    infer R
  >
    ? R
    : never;
  return {
    dispatch: store.dispatch,
    useSelector: <S extends Selector<any, any>>(
      selector: S,
    ): ExtractReturnType<S> => {
      return selector(store.getState());
    },
  };
};
