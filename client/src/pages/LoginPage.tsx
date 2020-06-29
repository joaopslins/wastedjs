import React, { useState } from "react";
import { Card, Row, Col, Form, Button, FormGroup } from "react-bootstrap";
import styled from "styled-components";
import { useSocket } from "../socket";

const LoginPageContainer = styled.div`
  margin-top: 96px;
`;

export const LoginPage = () => {
  const [nick, setNick] = useState("");
  const socket = useSocket();

  const handleSubmit = async () => {
    const success = await socket.login(nick);
    console.log(success);
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </LoginPageContainer>
  );
};
