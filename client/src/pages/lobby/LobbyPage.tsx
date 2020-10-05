import React, { useEffect, useState } from "react";
import { useSocket, SocketProvider } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { saveName, savePlayerList, playerReady } from "../../redux/gameSlice";
import {
  selectName,
  selectPlayerList,
  selectCurrentPlayer,
} from "../../redux/selectors";
import styled from "styled-components";
import { Row, Col, Card, Button } from "react-bootstrap";
import { ReduxState } from "../../redux/store";
import { useHistory } from "react-router-dom";
import { BsExclamationCircle, BsCheckCircle, BsCheck } from "react-icons/bs";
import { LobbyInstructions } from "./LobbyInstructions";

const LobbyPageContainer = styled.div`
  margin-top: 80px;
`;

const PlayerlistItem = styled.div<{
  ready: boolean;
}>`
  font-weight: bold;
  display: flex;
  align-items: center;
  color: ${({ ready }) => (ready ? "darkgreen" : "darkred")};
`;

export const LobbyPage = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  const currentPlayer = useSelector(selectCurrentPlayer);
  const playerList = useSelector(selectPlayerList);

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

  const handleReady = () => {
    const newReady = !currentPlayer.ready;
    dispatch(playerReady({ name: currentPlayer.name, ready: newReady }));
    socket.ready(currentPlayer.name, newReady);
  };

  const handleStartGame = () => {};

  const isHost = currentPlayer?.name === playerList[0]?.name;
  const isEveryoneReady = playerList.every((player) => player.ready);
  const canStartGame = isEveryoneReady && playerList.length > 1;

  if (loading) return null;

  return (
    <LobbyPageContainer>
      <Row>
        <Col xs="4" md="3">
          <Card>
            <Card.Header>Login</Card.Header>
            <Card.Body>
              <Card.Text className="text-center">
                You are logged in, {currentPlayer.name}
              </Card.Text>
              <Button type="button" block onClick={handleLogout}>
                Exit Lobby
              </Button>
            </Card.Body>
          </Card>
          <Card className="mt-3">
            <Card.Header>Players</Card.Header>
            <Card.Body>
              {playerList.map((player) => (
                <>
                  <PlayerlistItem ready={player.ready}>
                    {player.ready ? <BsCheck /> : <BsExclamationCircle />}
                    <span className="ml-1">{player.name}</span>
                  </PlayerlistItem>
                </>
              ))}
            </Card.Body>
            <Card.Footer>
              <Button type="button" block onClick={handleReady}>
                Ready
              </Button>
              {isHost && (
                <Button
                  type="button"
                  variant="success"
                  block
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                >
                  Start game
                </Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
        <Col xs="8" md="9">
          <LobbyInstructions />
        </Col>
      </Row>
    </LobbyPageContainer>
  );
};
