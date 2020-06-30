import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  FormGroup,
  Alert,
} from "react-bootstrap";
import styled from "styled-components";
import { useSocket } from "../socket";
import { useHistory } from "react-router-dom";

const LoginPageContainer = styled.div`
  margin-top: 96px;
`;

export const LoginPage = () => {
  const [nick, setNick] = useState("");
  const [error, setError] = useState("");
  const socket = useSocket();
  const history = useHistory();

  const handleSubmit = async () => {
    if (!nick) return;

    const loginError = await socket.login(nick);

    if (loginError) {
      setError(loginError);
      return;
    }

    socket.loggedIn = true;
    history.push("/lobby");
  };

  return (
    <LoginPageContainer>
      <Row>
        <Col sm={{ span: 4, offset: 4 }}>
          <Card>
            <Card.Header>Login</Card.Header>
            <Card.Body>
              <FormGroup>
                <Form.Label>Nick</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter a nickname"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                />
              </FormGroup>
              <Button type="button" block onClick={handleSubmit}>
                Join Lobby
              </Button>
              {error && (
                <Alert className="mt-3" variant="danger">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </LoginPageContainer>
  );
};
