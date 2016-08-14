(function() {
	'use strict';

	angular
        .module("wastedJSapp")
		.factory("lobbyService", lobbyServ);

	function lobbyServ () {
		var players = [];
        var myName = '';

		var lobby = {
			"getPlayers": getPlayers,
            "setPlayers": setPlayers,
            "toggleReady": toggleReady,
            "addPlayer": addPlayer,
            "removePlayer": removePlayer,
            "updateReadyForPlayer": updateReadyForPlayer,
            "getReady": getReady,
            "getMyName": getMyName,
            "startGame": startGame
		};

		return lobby;

		///////////////////

        function getPlayers() {
            return players;
        };

        function setPlayers(data) {
            players = data.playerList;
            myName = data.name;
        };

		function toggleReady() {
			let isReadyToStart = true;

			//At least 2 players
			if (players.length == 1) {
				isReadyToStart = false;
			}

			//Check if everyone is ready
			for (let i in players) {
                if (players[i].name == myName) {
                    players[i].ready = !players[i].ready;
                }

				if (!players[i].ready) {
					isReadyToStart = false;
				}
			}

			return isReadyToStart;
		};

        function addPlayer(player) {
            players.push(player);
        }

        function removePlayer(playerName) {
            //Remove player
			players = players.filter(function(player) {
				return player.name != playerName;
			});

            //Check if it's first player
            if (players[0].name == myName) {
                return true;
            } else {
                return false;
            }
        }

        function updateReadyForPlayer(player) {
			let readyToStart = true;

        	for (let i in players) {
        		//Update player ready in local player list
        		if (players[i].name == player.name) {
        			players[i].ready = player.ready;
        		}

        		//Check if everyone is ready
        		if (!players[i].ready) {
        			readyToStart = false;
        		}
        	}

        	//At least 2 players to start the game
        	if (players.length == 1) {
        		readyToStart = false;
        	}

            return readyToStart;
        }

        function getReady() {
            for (let i in players) {
                if (players[i].name == myName) {
                    return players[i].ready;
                }
            }

            return null;
        };

        function getMyName() {
            return myName;
        }

        function startGame(startingPlayer) {
			for (let i in players) {
				if (players[i].name == startingPlayer) {
					players[i].turn = true;
				} else {
					players[i].turn = false;
				}
			}
        }
	};
})();
