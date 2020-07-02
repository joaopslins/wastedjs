import { ReduxState } from "./store";

export const selectIsHost = (state: ReduxState) =>
  state.name === state.playerList[0].name;

export const selectName = (state: ReduxState) => state.name;

export const selectPlayerList = (state: ReduxState) => state.playerList;
