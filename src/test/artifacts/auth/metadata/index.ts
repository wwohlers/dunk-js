import {DunkInterfaceCreator} from "../../../../interface";
import {AuthMetadataActions, AuthMetadataModule} from "./types";
import {ExtraArgs, RootState} from "../../types";

const face = new DunkInterfaceCreator<AuthMetadataModule, RootState, ExtraArgs>();

const actions = face.createActionCreators({
  setLastSignIn: (value: number) => ({
    type: AuthMetadataActions.SET_LAST_SIGN_IN,
    payload: value,
  }),
  setNumSignIns: (value: number) => ({
    type: AuthMetadataActions.SET_NUM_SIGN_INS,
    payload: value,
  })
});

export const AuthMetadataInterface = face.createInterfacePiece({
  actions,
});
