import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { Switch, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import styled from "styled-components";

const AppContainer = styled.div`
  background: #efefef;
  height: 100%;
`;

const App = () => (
  <>
    <AppContainer>
      <Container fluid>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>WastedJS</Navbar.Brand>
        </Navbar>

        {/* Routing */}

        <Switch>
          <Route exact path="/">
            <LoginPage />
          </Route>
          <Route path="/lobby"></Route>
          <Route path="/game"></Route>
        </Switch>
      </Container>
    </AppContainer>
  </>
);

export default App;
