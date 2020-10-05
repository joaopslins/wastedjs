import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { Switch, Route, Redirect } from "react-router-dom";
import { LoginPage } from "./pages/login/LoginPage";
import styled from "styled-components";
import { useSocket } from "./socket";
import { LobbyPage } from "./pages/lobby/LobbyPage";
import { GamePage } from "./pages/game/GamePage";

const AppContainer = styled.div`
  background: #efefef;
  min-height: 100%;
  padding: 0 0 48px;
`;

type PrivateRouteProps = {
  children: React.ReactElement;
};

const PrivateGuard = ({ children }: PrivateRouteProps) => {
  const socket = useSocket();
  return socket.isConnected ? children : <Redirect to="/" />;
};

const App = () => (
  <>
    <AppContainer>
      <Container>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>WastedJS</Navbar.Brand>
        </Navbar>

        {/* Routing */}

        <Switch>
          <Route exact path="/">
            <LoginPage />
          </Route>

          <Route path="/lobby">
            <PrivateGuard>
              <LobbyPage></LobbyPage>
            </PrivateGuard>
          </Route>

          <Route path="/game">
            <PrivateGuard>
              <GamePage></GamePage>
            </PrivateGuard>
          </Route>
        </Switch>
      </Container>
    </AppContainer>
  </>
);

export default App;
