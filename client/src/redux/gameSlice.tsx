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
    saveName: (store, action: PayloadAction<string>) => {
      store.name = action.payload;
    },
    savePlayerList: (store, action: PayloadAction<Player[]>) => {
      store.playerList = action.payload;
    },
  },
});

export const { saveName, savePlayerList } = gameSlice.actions;

export default gameSlice.reducer;
