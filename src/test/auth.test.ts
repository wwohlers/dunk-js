import {initStore, Store} from "./artifacts";
import {User} from "./artifacts/api";

const user: User = {
  username: "testUser",
  email: "testuser@gmail.com",
};

describe('auth actions', () => {
  it('logs in and out', () => {
    const store = initStore();
    const getUser = () => store.useSelector(Store.Auth.selectors.getUser);
    const isSignedIn = () => store.useSelector(Store.Auth.selectors.isSignedIn);

    store.dispatch(Store.Auth.actions.logIn(user));
    expect(getUser()).toBe(user);
    expect(isSignedIn()).toBe(true);

    store.dispatch(Store.Auth.actions.logOut());
    expect(getUser()).toBeUndefined();
    expect(isSignedIn()).toBe(false);
  });
});

describe('auth selectors', () => {
  it('works', () => {
    const store = initStore();
    const root = () => store.useSelector(Store.Auth.selectors.root);
    const getUser = () => store.useSelector(Store.Auth.selectors.getUser);

    store.dispatch(Store.Auth.actions.logIn(user));
    expect(root().user).toEqual(getUser());
  });
});

describe('auth thunks', () => {
  it('signs in', async () => {
    const store = initStore();
    const isSignedIn = () => store.useSelector(Store.Auth.selectors.isSignedIn);

    expect(isSignedIn()).toBe(false);

    await store.dispatch(Store.Auth.thunks.signIn("test"));
    expect(isSignedIn()).toBe(true);
    const lastSignIn = store.useSelector(Store.Auth.selectors.root).Metadata.lastSignIn;
    expect(lastSignIn && Date.now() - lastSignIn < 1000).toBeTruthy();
  });
});
