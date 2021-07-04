import {Api} from "./api";
import {AuthModule} from "./auth/types";
import {TodoModule} from "./todos/types";
import {DunkActionPayloads, DunkModule} from "../../index";

export interface Settings {
  isBrowser: boolean;
  theme: "light" | "dark";
}

export type ExtraArgs = {
  api: typeof Api;
}

export type RootState = {
  settings: Settings;
  Auth: AuthModule;
  Todos: TodoModule;
};

export enum RootActions {
  SET_IS_BROWSER = "set-is-browser",
  SET_THEME = "set-theme",
}

type RootActionMap = DunkActionPayloads<RootActions, {
  [RootActions.SET_IS_BROWSER]: boolean;
  [RootActions.SET_THEME]: "light" | "dark";
}>

export type RootModule = DunkModule<RootState, RootActions, RootActionMap>;
