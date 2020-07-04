import { ReduxState } from "./store";

export const selectName = (state: ReduxState) => state.name;

export const selectCurrentPlayer = (state: ReduxState) => {
  return state.playerList.find((player) => player.name === state.name)!;
};

export const selectPlayerList = (state: ReduxState) => state.playerList;
