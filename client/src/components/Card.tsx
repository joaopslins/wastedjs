import React from "react";
import styled from "styled-components";

const CardWrapper = styled.button<{ color: string }>`
  width: 96px;
  height: 150px;
  background-color: #ffffff;
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.15);
  border-radius: 0.25em;
  border: 0;
  color: ${({ color }) => color};

  position: relative;
  font-family: "Card Characters";
  user-select: none;
`;

const CardSuit = styled.div`
  position: absolute;
  font-size: 30px;
  line-height: 1;
  left: 5px;
  top: 5px;
`;

const CardRank = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 60px;
`;

const suitMapping: {
  [key: string]: string;
} = {
  C: "]",
  H: "{",
  S: "}",
  D: "[",
};

type CardProps = {
  card: string;
  onClick?: () => void;
};

export const Card = ({ card, onClick = () => {} }: CardProps) => {
  const rank = card[0];
  const suit = card[1];
  let color = "black";

  if (suit === "H" || suit === "D") {
    color = "red";
  }

  return (
    <CardWrapper type="button" color={color} onClick={onClick}>
      <CardSuit>{rank}</CardSuit>
      <CardRank>{suitMapping[suit]}</CardRank>
    </CardWrapper>
  );
};
