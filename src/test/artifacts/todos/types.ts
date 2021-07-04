import {DunkActionPayloads, DunkModule} from "../../../index";
import {Todo} from "../api";

type TodoState = {
  todos: Todo[];
  active: Todo | undefined;
}

export enum TodoActions {
  SET_TODOS = "todos/set-todos",
  ADD_TODO = "todos/add-todo",
  CLEAR_TODOS = "todos/clear-todos",
  SET_ACTIVE_TODO = "todos/set-active",
  CLEAR_ACTIVE_TODO = "todos/clear-active",
}

type TodoActionMap = DunkActionPayloads<TodoActions, {
  [TodoActions.SET_TODOS]: Todo[],
  [TodoActions.ADD_TODO]: Todo,
  [TodoActions.CLEAR_TODOS]: undefined,
  [TodoActions.SET_ACTIVE_TODO]: Todo,
  [TodoActions.CLEAR_ACTIVE_TODO]: undefined,
}>;

export type TodoModule = DunkModule<TodoState, TodoActions, TodoActionMap>;
