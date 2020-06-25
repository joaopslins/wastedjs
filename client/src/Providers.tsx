import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return <Provider store={store}>{children}</Provider>;
};
