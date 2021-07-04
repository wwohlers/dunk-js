import {DunkActionPayloads, DunkModule} from "../../../../index";

type AuthMetadataState = {
  lastSignIn: number | undefined;
  numSignIns: number;
}

export enum AuthMetadataActions {
  SET_LAST_SIGN_IN = "auth/metadata/set-last-sign-in",
  SET_NUM_SIGN_INS = "auth/metadata/set-num-sign-ins",
}

type AuthMetadataActionMap = DunkActionPayloads<AuthMetadataActions, {
  [AuthMetadataActions.SET_LAST_SIGN_IN]: number;
  [AuthMetadataActions.SET_NUM_SIGN_INS]: number;
}>;

export type AuthMetadataModule = DunkModule<AuthMetadataState, AuthMetadataActions, AuthMetadataActionMap>;
