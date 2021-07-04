import {DunkInterfaceCreator} from "../../../interface";
import {AuthActions, AuthModule} from "./types";
import {ExtraArgs, RootState} from "../types";
import {User} from "../api";
import {AuthMetadataInterface} from "./metadata";

const face = new DunkInterfaceCreator<AuthModule, RootState, ExtraArgs>();

const actions = face.createActionCreators({
  logIn: (user: User) => ({
    type: AuthActions.LOG_IN,
    payload: user,
  }),
  logOut: () => ({
    type: AuthActions.LOG_OUT,
  })
});

const thunks = face.createThunks({
  signIn: (username: string) => {
    return async (dispatch, getState, extraArgument) => {
      const user = await extraArgument.api.signIn();
      dispatch(actions.logIn(user));
      dispatch(AuthMetadataInterface.actions.setLastSignIn(Date.now()));
      const numSignIns = getState().Auth.Metadata.numSignIns;
      dispatch(AuthMetadataInterface.actions.setNumSignIns(numSignIns + 1));
    }
  }
});

const selectors = face.createSelectors({
  getUser: state => state.user,
  isSignedIn: state => !!state.user,
});

export const AuthInterface = face.createInterfacePiece({
  actions,
  thunks,
  selectors,
}, {
  Metadata: AuthMetadataInterface
});
