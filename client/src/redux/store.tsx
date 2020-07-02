import { configureStore } from "@reduxjs/toolkit";
import gameSlice from "./gameSlice";

export default configureStore({
  reducer: gameSlice,
});

export type ReduxState = ReturnType<typeof gameSlice>;
