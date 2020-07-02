import React, { useEffect, useState } from "react";
import { useSocket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { saveName, savePlayerList } from "../redux/gameSlice";
import { selectName } from "../redux/selectors";
import styled from "styled-components";
import { Row, Col, Card, Button } from "react-bootstrap";
import { ReduxState } from "../redux/store";
import { useHistory } from "react-router-dom";

const LobbyPageContainer = styled.div`
  margin-top: 96px;
`;

export const LobbyPage = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  const playerName = useSelector(selectName);

  useEffect(() => {
    const request = async () => {
      const data = await socket.requestPlayerList();
      dispatch(saveName(data.name));
      dispatch(savePlayerList(data.playerList));
      setLoading(false);
    };

    request();
  }, [socket, dispatch]);

  const handleLogout = () => {
    history.push("/");
  };

  if (loading) return null;

  return (
    <LobbyPageContainer>
      <Row>
        <Col xs="4" md="3">
          <Card>
            <Card.Header>Login</Card.Header>
            <Card.Body>
              <Card.Text className="text-center">
                You are logged in, {playerName}
              </Card.Text>
              <Button type="button" block onClick={handleLogout}>
                Exit Lobby
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </LobbyPageContainer>
  );
};
