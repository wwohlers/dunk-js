export interface User {
  username: string;
  email: string;
}

export interface Todo {
  name: string;
  completed: boolean;
  dueBy: number;
}

export const Api = {
  async getTodos(): Promise<Todo[]> {
    return [
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
    ]
  },

  async signIn(): Promise<User> {
    return {
      username: "testUser",
      email: "testuser@gmail.com",
    }
  }
}
