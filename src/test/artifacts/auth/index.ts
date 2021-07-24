import { DunkInterfaceCreator } from '../../../interface';
import { AuthActions, AuthModule } from './types';
import { ExtraArgs, RootState } from '../types';
import { User } from '../api';
import { AuthMetadataInterface } from './metadata';

const face = new DunkInterfaceCreator<AuthModule, RootState, ExtraArgs>();

const getUser = face.defineSelector(() => (state) => state.user);

const isSignedIn = face.defineSelector(() => (state) => !!state.user);

const logIn = face.defineActionCreator((user: User) => ({
  type: AuthActions.LOG_IN,
  payload: user,
}));

const logOut = face.defineActionCreator(() => ({
  type: AuthActions.LOG_OUT,
}));

const signIn = face.defineActionCreator((username: string) => {
  return async (dispatch, getState, extraArgument) => {
    const user = await extraArgument.api.signIn();
    dispatch(logIn(user));
    dispatch(AuthMetadataInterface.actionCreators.setLastSignIn(Date.now()));
    const numSignIns = getState().Auth.Metadata.numSignIns;
    dispatch(AuthMetadataInterface.actionCreators.setNumSignIns(numSignIns + 1));
  };
});
export const AuthInterface = face.createInterfacePiece(
  {
    actionCreators: {
      logIn,
      logOut,
      signIn,
    },
    selectors: {
      getUser,
      isSignedIn,
    },
  },
  {
    Metadata: AuthMetadataInterface,
  },
);
