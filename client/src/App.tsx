import React from "react";
import { Navbar } from "react-bootstrap";
import { Switch, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";

const App = () => (
  <>
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
  </>
);

export default App;
