import {DunkInterfaceCreator} from "../../../interface";
import {TodoActions, TodoModule} from "./types";
import {ExtraArgs, RootState} from "../types";
import {Todo} from "../api";

const face = new DunkInterfaceCreator<TodoModule, RootState, ExtraArgs>();

const actions = face.createActionCreators({
  addTodo: (todo: Todo) => ({
    type: TodoActions.ADD_TODO,
    payload: todo,
  }),
  setTodos: (todo: Todo[]) => ({
    type: TodoActions.SET_TODOS,
    payload: todo,
  }),
  clearTodos: () => ({
    type: TodoActions.CLEAR_TODOS,
  }),
  setActiveTodo: (todo: Todo) => ({
    type: TodoActions.SET_ACTIVE_TODO,
    payload: todo,
  }),
  clearActiveTodo: () => ({
    type: TodoActions.CLEAR_ACTIVE_TODO,
  }),
});

const thunks = face.createThunks({
  fetchTodos: () => {
    return async (dispatch, getState, extraArgument) => {
      const todos = await extraArgument.api.getTodos()
      dispatch(actions.setTodos(todos));
      return todos;
    }
  }
});

const selectors = face.createSelectors({
  selectTodos: state => state.todos,
  selectActive: state => state.active,
});

export const TodoInterface = face.createInterfacePiece({
  actions,
  selectors,
  thunks,
});
