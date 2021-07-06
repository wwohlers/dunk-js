import {initStore, Store} from "./artifacts";

describe('metadata actions', () => {
  it('sets lastSignIn', () => {
    const store = initStore();
    const getLastSignIn = () => store.useSelector(Store.Auth.Metadata.selectors.root).lastSignIn;

    expect(getLastSignIn()).toBeUndefined();

    store.dispatch(Store.Auth.Metadata.actionCreators.setLastSignIn(5));
    expect(getLastSignIn()).toBe(5);
  })
})
