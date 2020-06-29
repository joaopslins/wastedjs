import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import store from "./redux/store";
import { SocketProvider } from "./socket";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <Provider store={store}>
      <Router>
        <SocketProvider>{children}</SocketProvider>
      </Router>
    </Provider>
  );
};
