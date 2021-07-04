import {composeReducers} from "../../../compose";
import {TodoModule} from "./types";
import {TodoActions} from "./types";

export const todoReducer = composeReducers<TodoModule>({
  todos: [],
  active: undefined,
}, {
  [TodoActions.ADD_TODO]: (state, payload) => {
    return { ...state, todos: [...state.todos, payload ] }
  },
  [TodoActions.CLEAR_ACTIVE_TODO]: (state, payload) => {
    return { ...state, active: undefined }
  },
  [TodoActions.SET_ACTIVE_TODO]: (state, payload) => {
    return { ...state, active: payload }
  },
  [TodoActions.CLEAR_TODOS]: (state, payload) => {
    return { ...state, todos: [] }
  },
  [TodoActions.SET_TODOS]: (state, payload) => {
    return { ...state, todos: payload };
  }
})
