import {initStore, Store} from "./artifacts";
import {Todo} from "./artifacts/api";

const todo1: Todo = {
  name: "Todo 1",
  dueBy: 5,
  completed: false,
};

const todo2: Todo = {
  name: "Todo 2",
  dueBy: 10,
  completed: true,
}

describe('todos actions', () => {
  it('adds a todo', () => {
    const store = initStore();
    const getTodos = () => store.useSelector(Store.Todos.selectors.selectTodos);

    store.dispatch(Store.Todos.actions.addTodo(todo1));
    expect(getTodos()).toEqual([todo1]);

    store.dispatch(Store.Todos.actions.addTodo(todo2));
    expect(getTodos()).toEqual([todo1, todo2]);
  });

  it('sets/clears todos', () => {
    const store = initStore();
    const getTodos = () => store.useSelector(Store.Todos.selectors.selectTodos);

    store.dispatch(Store.Todos.actions.setTodos([todo2, todo1]));
    expect(getTodos()).toEqual([todo2, todo1]);

    store.dispatch(Store.Todos.actions.clearTodos());
    expect(getTodos().length).toBe(0);
  });

  it('sets/clears active todo', () => {
    const store = initStore();
    const getActive = () => store.useSelector(Store.Todos.selectors.selectActive);

    store.dispatch(Store.Todos.actions.setActiveTodo(todo2));
    expect(getActive()).toEqual(todo2);

    store.dispatch(Store.Todos.actions.clearActiveTodo());
    expect(getActive()).toBeUndefined();
  });
});

describe('root selectors', () => {
  it('works', () => {
    const store = initStore();
    const getRoot = () => store.useSelector(Store.Todos.selectors.root);
    const getActive = () => store.useSelector(Store.Todos.selectors.selectActive);

    store.dispatch(Store.Todos.actions.setTodos([todo1]));
    expect(getRoot().active).toEqual(getActive());
  });
});

describe('todos thunks', () => {
  it('fetches todos', async () => {
    const store = initStore();
    const getTodos = () => store.useSelector(Store.Todos.selectors.selectTodos);

    const todos = await store.dispatch(Store.Todos.thunks.fetchTodos());
    expect(todos).toEqual([
      {
        name: "Test Todo 1",
        dueBy: 24023,
        completed: false,
      },
      {
        name: "Test Todo 2",
        dueBy: 563048,
        completed: true,
      },
    ]);
    expect(getTodos()).toEqual(todos);
  });
});
