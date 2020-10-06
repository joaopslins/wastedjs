import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Player = {
  name: string;
  ready: boolean;
  lives: number;
  won: number;
  bet: number;
  isAlive: boolean;
  card: string;
};

const gameSlice = createSlice({
  name: "game",
  initialState: {
    name: "",
    playerList: [] as Player[],
  },
  reducers: {
    // Callbacks from client emited events
    saveName: (store, action: PayloadAction<string>) => {
      store.name = action.payload;
    },
    savePlayerList: (store, action: PayloadAction<Player[]>) => {
      store.playerList = action.payload;
    },

    // Callbacks from server events
    playerConnect: (store, action: PayloadAction<Player>) => {
      store.playerList.push(action.payload);
    },
    playerReady: (
      store,
      action: PayloadAction<{
        name: string;
        ready: boolean;
      }>
    ) => {
      const player = store.playerList.find(
        (player) => player.name === action.payload.name
      );
      if (!player) return;

      player.ready = action.payload.ready;
    },
    playerRemove: (store, action: PayloadAction<string>) => {
      store.playerList = store.playerList.filter(
        (player) => player.name !== action.payload
      );
    },
  },
});

export const {
  saveName,
  savePlayerList,
  playerConnect,
  playerReady,
  playerRemove,
} = gameSlice.actions;

export default gameSlice.reducer;
