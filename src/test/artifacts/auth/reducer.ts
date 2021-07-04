import {composeReducers} from "../../../compose";
import {AuthActions, AuthModule} from "./types";
import {AuthMetadataReducer} from "./metadata/reducer";

export const authReducer = composeReducers<AuthModule>({
  user: undefined,
  Metadata: AuthMetadataReducer
}, {
  [AuthActions.LOG_IN]: (state, payload) => {
    return { ...state, user: payload };
  },
  [AuthActions.LOG_OUT]: (state) => {
    return { ...state, user: undefined }
  }
})
