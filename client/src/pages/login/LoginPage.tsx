import React, { useState, useEffect } from "react";
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
import { useSocket } from "../../socket";
import { useHistory } from "react-router-dom";

const LoginPageContainer = styled.div`
  margin-top: 80px;
`;

export const LoginPage = () => {
  // const [nick, setNick] = useState("");
  const [error, setError] = useState("");
  const socket = useSocket();
  const history = useHistory();

  useEffect(() => {
    if (socket.isConnected) {
      socket.disconnect();
    }
  }, []);

  // Auto login, for quick reload
  useEffect(() => {
    handleSubmit();
  }, []);
  const [nick, setNick] = useState("hi");

  const handleSubmit = async () => {
    if (!nick) return;

    const loginError = await socket.login(nick);

    if (loginError) {
      setError(loginError);
      return;
    }

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
