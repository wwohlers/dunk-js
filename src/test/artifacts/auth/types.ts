import {User} from "../api";
import {AuthMetadataModule} from "./metadata/types";
import {DunkActionPayloads, DunkModule} from "../../../index";

type AuthState = {
  user: User | undefined;
  Metadata: AuthMetadataModule;
};

export enum AuthActions {
  LOG_IN = "auth/log-in",
  LOG_OUT = "auth/log-out",
}

type AuthActionMap = DunkActionPayloads<AuthActions, {
  [AuthActions.LOG_IN]: User,
  [AuthActions.LOG_OUT]: undefined,
}>;

export type AuthModule = DunkModule<AuthState, AuthActions, AuthActionMap>;
