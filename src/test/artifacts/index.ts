import { createDunkInterface, DunkInterfaceCreator } from '../../interface';
import { ExtraArgs, RootActions, RootModule, RootState } from './types';
import { AuthInterface } from './auth';
import { TodoInterface } from './todos';
import { rootReducer } from './reducer';
import { Api } from './api';
import { createDunkStore } from '../../compose';
import { UndunkedState } from '../../index';

const face = new DunkInterfaceCreator<RootModule, RootState, ExtraArgs>();

const getSettings = face.defineSelector((state) => state.settings);

const setIsBrowser = face.defineActionCreator((value: boolean) => ({
  type: RootActions.SET_IS_BROWSER,
  payload: value,
}));

const setTheme = face.defineActionCreator((value: RootState['settings']['theme']) => ({
  type: RootActions.SET_THEME,
  payload: value,
}));

const RootInterface = face.createInterfacePiece(
  {
    actions: {
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
  return {
    dispatch: store.dispatch,
    useSelector: <R>(selector: (root: UndunkedState<RootState>) => R): R => {
      return selector(store.getState());
    },
  };
};
