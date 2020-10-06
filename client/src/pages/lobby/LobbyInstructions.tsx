import React, { useState } from "react";
import { Row, Col, Card as BsCard } from "react-bootstrap";
import styled from "styled-components";
import { Card } from "../../components/Card";

const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 8px 0;

  > * {
    margin: 4px;
    flex: 0 1 auto;
  }
`;

export const LobbyInstructions = () => {
  const manilhas = ["4C", "7H", "AS", "7D"];
  const weakCards = [
    "3S",
    "2H",
    "AD",
    "KS",
    "JH",
    "QS",
    "7C",
    "6H",
    "5D",
    "4S",
  ];

  return (
    <BsCard>
      <BsCard.Header>Instructions</BsCard.Header>
      <BsCard.Body>
        <h2>How To Play</h2>
        <br />
        <p>
          WastedJS is a card based game. A game of WastedJS consists of a number
          of <b>matches</b> (currently starting with 2 cards until 8 cards), and
          each match has a number of <b>rounds</b>. The game objective is to
          guess correctly how many rounds you will win within a match.
        </p>
        <p>
          A round has 2 phases, the first one is the <b>betting phase</b>, on
          which players will take turns betting how many rounds they think
          they'll win.
        </p>
        <p>
          The second phase of a round is the <b>playing phase</b>, on which
          players will take turns playing one card at a time. To win a round, a
          player has to have played the card with <b>highest</b> value among the
          others at the end of a round. When there is a <b>tie</b>, no one wins
          that round.
        </p>
        <p>
          The match ends when all cards are played. Then, the players' lives
          will be <b>deducted</b> based on the <b>difference</b> between their
          wins and bets. If a player bet the same amount of won rounds, they
          will not lose lives. Afterwards, a new match can be started. The
          players begin with 3 lives each. Game is over if there is only 1
          player left alive or after the 8th match.
        </p>
        <p>
          <b>Tie betting rule</b> : The last player <b>cannot</b> tie bets. This
          mean that the bets' sum cannot be equal to the number of cards given
          to the players. This rule increases the chance of losing lives at the
          end of the match.
        </p>
        <p>
          <b>Player Order</b> : The player who will start the next round is the
          one who won the previous round. When there is a <b>tie</b>, the last
          player to tie will be the first one in the next round. The match
          starting player will cycle for each match.
        </p>
        <p>
          <b>Card order</b> : The cards are divided in 2 groups. The first one
          is called <b>Manilhas</b>, they are the strongest cards. There are
          only 4 of them, with specific number/suit combination. They are, in
          order of strength:
          <br />
          <CardsWrapper>
            {manilhas.map((card) => (
              <Card card={card} />
            ))}
          </CardsWrapper>
          The weak cards can have any suit, excluding the Manilhas, of course.
          They are, in order of strength:
          <CardsWrapper>
            {weakCards.map((card) => (
              <Card card={card} />
            ))}
          </CardsWrapper>
          <br />
        </p>
      </BsCard.Body>
    </BsCard>
  );
};
