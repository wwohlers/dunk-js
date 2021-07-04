import {composeReducers} from "../../compose";
import {RootActions, RootModule} from "./types";
import {authReducer} from "./auth/reducer";
import {todoReducer} from "./todos/reducer";

export const rootReducer = composeReducers<RootModule>({
  settings: {
    isBrowser: true,
    theme: "light",
  },
  Auth: authReducer,
  Todos: todoReducer,
}, {
  [RootActions.SET_THEME]: (state, payload) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        theme: payload
      }
    }
  },
  [RootActions.SET_IS_BROWSER]: (state, payload) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        isBrowser: payload
      }
    }
  }
});
