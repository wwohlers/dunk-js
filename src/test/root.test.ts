import { initStore, Store } from './artifacts';

describe('root actions', () => {
  it('sets is browser', () => {
    const store = initStore();
    const isBrowser = () =>
      store.useSelector(Store.selectors.getSettings()).isBrowser;

    store.dispatch(Store.actionCreators.setIsBrowser(true));
    expect(isBrowser()).toBe(true);

    store.dispatch(Store.actionCreators.setIsBrowser(false));
    expect(isBrowser()).toBe(false);
  });

  it('sets theme', () => {
    const store = initStore();
    const theme = () => store.useSelector(Store.selectors.getSettings()).theme;

    store.dispatch(Store.actionCreators.setTheme('dark'));
    expect(theme()).toBe('dark');

    store.dispatch(Store.actionCreators.setTheme('light'));
    expect(theme()).toBe('light');
  });
});

describe('root selectors', () => {
  it('selects root', () => {
    const store = initStore();
    const rootState = store.useSelector(Store.selectors.root);
    const settings = store.useSelector(Store.selectors.getSettings());
    expect(rootState.settings).toEqual(settings);
  });
});
