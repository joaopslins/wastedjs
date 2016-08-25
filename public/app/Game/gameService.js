(function() {
	'use strict';

	angular
        .module("wastedJSapp")
		.factory("gameService", gameServ);

	function gameServ (lobbyService) {
		var players = [];
        var me = null;
        var matchNumber = 0;

		var game = {
            updateData: updateData,
            generateBetOptions: generateBetOptions,
            updateBetOptions: updateBetOptions,
            betTurn: betTurn,
            cardTurn: cardTurn,
            newRoundUpdate: newRoundUpdate,
            newMatchUpdate: newMatchUpdate,
            checkHeartFade: checkHeartFade,
            setMatchNumber: setMatchNumber,
            getMatchNumber: getMatchNumber,
            getPlayerlist: getPlayerlist,
            getMe: getMe
		};

		return game;

		///////////////////

        function updateData() {
            players = lobbyService.getPlayers();

            for (let i in players) {
                if (players[i].name == lobbyService.getMyName()) {
                    me = players[i];
                }
            }
        };

        function generateBetOptions() {
            let ret = [];
            for (let i = 0; i < matchNumber; i++) {
                ret.push(i);
            }
            ret.push(matchNumber);

            return ret;
        };

        function updateBetOptions() {
            let betOp = generateBetOptions();

			//Check if it's last player
			let isLast = true;
			for (let i in players) {
				//If there is a player who didn't bet and is alive, is not last
				if (players[i].name != me.name && players[i].bet == '-' && players[i].lives > 0) {
					isLast = false;
					break;
				}
			}

			//Check which bet is blocked
			if (isLast) {
				let betSum = 0;
				for (let i in players) {
					if (players[i].name != me.name && players[i].lives > 0) {
						betSum += players[i].bet;
					}
				}

				let cantBet = matchNumber - betSum;

				betOp = betOp.filter(function(iBet) {
					if  (iBet != cantBet) {
						return true;
					} else {
						return false;
					}
				});
			}

            return betOp;
        };

        function betTurn(data) {
			for (let i in players) {
				if (players[i].name == data.playerWhoBet) {
					players[i].bet = data.bet;
				}

				if (players[i].name == data.nextPlayer) {
					players[i].turn = true;
				} else {
					players[i].turn = false;
				}
			}

            return players;
        };

        function cardTurn(data) {
			for (let i in players) {
				if (players[i].name == data.playerWhoPlayed) {
					players[i].card = data.card;
				}

				if (players[i].name == data.nextPlayer) {
					players[i].turn = true;
				} else {
					players[i].turn = false;
				}
			}

			//If it's last round, check who won to apply indicator
			if (data.wonPlayer) {
				for (let i in players) {
					if (players[i].name == data.wonPlayer) {
						players[i].wonRound = true;
					} else {
						players[i].wonRound = false;
					}
				}
			}

            return players;
        };

        function newRoundUpdate(data) {
			for (let i in players) {
				players[i].won = data.players[i].won;
				players[i].card = '';
				players[i].wonRound = false;

				if (players[i].name == data.playerToPlay) {
					players[i].turn = true;
				} else {
					players[i].turn = false;
				}
			}

            return players;
        };

        function newMatchUpdate(data) {
			for (let i in players) {
				players[i].lives = data.players[i].lives;
				players[i].bet = '-';
				players[i].won = 0;

				if (players[i].name == data.playerToPlay) {
					players[i].turn = true;
				} else {
					players[i].turn = false;
				}
			}

            return players;
        };

        function checkHeartFade(heartNumber, playerName) {
        	for (let i in players) {
        		if (players[i].name == playerName) {
        			let heartsLost = Math.abs(players[i].won - players[i].bet);
        			return (heartNumber >= (players[i].lives - heartsLost));
        		}
        	}
        }

        function setMatchNumber(number) {
            matchNumber = number;
        };

        function getMatchNumber() {
            return matchNumber;
        };

        function getPlayerlist() {
            return players;
        };

        function getMe() {
            return me;
        };
	};
})();
