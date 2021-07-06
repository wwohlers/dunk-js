import { DunkInterfaceCreator } from '../../../interface';
import { TodoActions, TodoModule } from './types';
import { ExtraArgs, RootState } from '../types';
import { Todo } from '../api';

const face = new DunkInterfaceCreator<TodoModule, RootState, ExtraArgs>();

const getTodos = face.defineSelector((state) => state.todos);

const getActive = face.defineSelector((state) => state.active);

const addTodo = face.defineActionCreator((todo: Todo) => ({
  type: TodoActions.ADD_TODO,
  payload: todo,
}));

const setTodos = face.defineActionCreator((todos: Todo[]) => ({
  type: TodoActions.SET_TODOS,
  payload: todos,
}));

const clearTodos = face.defineActionCreator(() => ({
  type: TodoActions.CLEAR_TODOS,
}));

const setActiveTodo = face.defineActionCreator((todo: Todo) => ({
  type: TodoActions.SET_ACTIVE_TODO,
  payload: todo,
}));

const clearActiveTodo = face.defineActionCreator(() => ({
  type: TodoActions.CLEAR_ACTIVE_TODO,
}));

const fetchTodos = face.defineActionCreator(() => {
  return async (dispatch, getState, extraArgument) => {
    const todos = await extraArgument.api.getTodos();
    dispatch(setTodos(todos));
    return todos;
  };
});

export const TodoInterface = face.createInterfacePiece({
  actions: {
    addTodo,
    setTodos,
    clearTodos,
    setActiveTodo,
    clearActiveTodo,
    fetchTodos,
  },
  selectors: {
    getTodos,
    getActive,
  },
});
