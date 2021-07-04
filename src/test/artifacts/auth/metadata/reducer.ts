import {composeReducers} from "../../../../compose";
import {AuthMetadataActions, AuthMetadataModule} from "./types";

export const AuthMetadataReducer = composeReducers<AuthMetadataModule>({
  lastSignIn: undefined,
  numSignIns: 0,
}, {
  [AuthMetadataActions.SET_LAST_SIGN_IN]: (state, payload) => {
    return { ...state, lastSignIn: payload };
  },
  [AuthMetadataActions.SET_NUM_SIGN_INS]: (state, payload) => {
    return { ...state, numSignIns: payload }
  }
});
