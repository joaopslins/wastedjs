(function() {
    angular
    	.module("wastedJSapp")
		.controller("gameController", gameCtrl);

	function gameCtrl($timeout, $window, $location, socket) {
        var vm = this;

		//Local variables
		vm.readyToStart = false;
		vm.firstPlayer = false;
		vm.isUp = false;
		vm.phase = false;
		vm.me = {
			name : "",
			ready : false,
			lives : 3,
			won : 0,
			bet : '-',
			card : '',
			turn: false
		};

		// Local player list
		vm.players = [];

		// Local player card list
		vm.cards = [];

		//Bet options
		vm.betOptions = [];

        //Function Binds
        vm.logoutToggle = logoutToggle;
        vm.readyToggle = readyToggle;
        vm.playCard = playCard;
        vm.betClick = betClick;
        vm.cardIsRed = cardIsRed;
        vm.cardSelect = cardSelect;
        vm.startGame = startGame;

        //Socket listener events
		socket.on('player-connect', playerConnectCB);
        socket.on('player-disconnect', playerDisconnectCB);
        socket.on('update-client-ready', updateClientReadyCB);
        socket.on('game-start-notification', gameStartNotificationCB);
        socket.on('bet-update', betUpdateCB);
        socket.on('play-update', playUpdateCB);
        socket.on('new-round', newRoundCB);
        socket.on('new-match', newMatchCB);
        socket.on('end-game', endGameCB);

        activate();

        //////////////////////////////

        function activate () {
            //Getting players and name
            socket.emit('request-playerlist', null, function (data){
                vm.players = data.playerList;
                for (let i in vm.players) {
                    if (vm.players[i].name == data.name) {
                        vm.me = vm.players[i];
                        break;
                    }
                }

                if(vm.players.length == 1){
                    vm.firstPlayer = true;
                }
            });
        }


        //////////////////////////////
        // Function Implementations //
        //////////////////////////////

		//logout button function
		function logoutToggle() {
			let exit = true;
			if (vm.isUp) {
				if ($window.confirm("This will end the game, are you sure?")) {
					exit = true;
				} else {
					exit = false;
				}
			}

			if (exit) {
				//Disconnect
				socket.disconnect();

				//Redirect
				$location.url("/");
			}
		};

		// Ready button function
		function readyToggle() {
			let aux = true;

			//Toggle ready variable
			vm.me.ready = !vm.me.ready;

			// Update to server
			socket.emit('ready', {
				name: vm.me.name,
				ready: vm.me.ready
			});

			//At least 2 players
			if (vm.players.length == 1) {
				aux = false;
			}

			//Check if everyone is ready
			for (i in vm.players) {
				if (!vm.players[i].ready) {
					aux = false;
				}
			}

			vm.readyToStart = aux;
		};

		//Play card button function
		function playCard() {
			if (vm.me.turn && vm.phase == 'play' && vm.me.card != '') {
				socket.emit('player-play-card', vm.me.card);

				//Remove played card
				vm.cards = vm.cards.filter(function (c) {
					if (c == vm.me.card) {
						return false;
					} else {
						return true;
					}
				});

				vm.me.turn = false;
				vm.me.card = '';
			}
		};

		function betClick(index) {
			bet = vm.betOptions[index];

			socket.emit('player-bet', bet);
			vm.me.turn = false;
			vm.me.bet = bet;
		};

		//Simple function if card is red
		function cardIsRed(card) {
			return (card[1] == 'H' || card[1] == 'D');
		};

		//Select card function
		function cardSelect(index) {
			if (vm.me.turn) {
				vm.me.card = vm.cards[index];
			}
		};

		//Start game - Only for host player
		function startGame() {
			if (vm.readyToStart) {
				socket.emit('start-game');
			}
		};

        /////////////////////////////
        //Socket listener callbacks//
        /////////////////////////////

        function playerConnectCB(newPlayer) {
			vm.players.push(newPlayer);

			vm.readyToStart = false;
		};

		function playerDisconnectCB(dcName) {
			vm.players = vm.players.filter(function(player) {
				return player.name != dcName;
			});

			if (vm.players[0].name == vm.me.name) {
				vm.firstPlayer = true;
			}

			vm.readyToStart = false;

			//If ongoing game
			if (vm.isUp) {
				vm.isUp = false;
				vm.me.ready = false;
			}
		};

		function updateClientReadyCB(client) {
			let aux = true;
			for (i in vm.players) {
				//Update player ready in local player list
				if (vm.players[i].name == client.name) {
					vm.players[i].ready = client.ready;
				}

				//Check if everyone is ready
				if (!vm.players[i].ready) {
					aux = false;
				}
			}

			//At least 2 players
			if (vm.players.length == 1) {
				aux = false;
			}

			vm.readyToStart = aux;
		};

		function gameStartNotificationCB(playerToPlay) {
			socket.emit('request-cards', null, function(data) {
				vm.cards = data.cards;
				vm.matchNumber = vm.cards.length;

				vm.betOptions.length = 0;
				for (var i = 0; i < vm.matchNumber; i++) {
					vm.betOptions.push(i);
				}
				vm.betOptions.push(vm.matchNumber);
			});

			//Set flags
			vm.isUp = true;
			vm.phase = "bet";

			//Reset Players Config
			for (let i in vm.players){
				vm.players[i].lives = 3;
				vm.players[i].won = 0;
				vm.players[i].bet = '-';
				vm.players[i].card = '';

				if (vm.players[i].name == playerToPlay) {
					vm.players[i].turn = true;
				} else {
					vm.players[i].turn = false;
				}
			}
		};

		function betUpdateCB(bet, playerWhoBet, nextPlayer, startPlayPhase) {
			//Updates bet locally and set turn
			for (let i in vm.players) {
				if (vm.players[i].name == playerWhoBet) {
					vm.players[i].bet = bet;
				}

				if (vm.players[i].name == nextPlayer) {
					vm.players[i].turn = true;
				} else {
					vm.players[i].turn = false;
				}
			}

			//Set bets
			if (vm.me.turn) {
				//Check if it's last player
				let isLast = true;
				for (let i in vm.players) {
					//If there is a player who didn't bet and is alive, is not last
					if (vm.players[i].name != vm.me.name && vm.players[i].bet == '-' && vm.players[i].lives > 0) {
						isLast = false;
						break;
					}
				}

				//Check which bet is blocked
				if (isLast) {
					let betSum = 0;
					for (let i in vm.players) {
						if (vm.players[i].name != vm.me.name && vm.players[i].lives > 0) {
							betSum += vm.players[i].bet;
						}
					}

					let cantBet = vm.matchNumber - betSum;

					vm.betOptions = vm.betOptions.filter(function(iBet) {
						if  (iBet != cantBet) {
							return true;
						} else {
							return false;
						}
					});
				}
			}

			//Change phase to play
			if (startPlayPhase) {
				vm.phase = "play";
			}
		};

		function playUpdateCB (card, playerWhoPlayed, nextPlayer) {
			//Update Card and turn locally
			for (let i in vm.players) {
				if (vm.players[i].name == playerWhoPlayed) {
					vm.players[i].card = card;
				}

				if (vm.players[i].name == nextPlayer) {
					vm.players[i].turn = true;
				} else {
					vm.players[i].turn = false;
				}
			}
		};

        function newRoundCB(players, playerToPlay) {
			//Updating player list
			for (let i in vm.players) {
				vm.players[i].won = players[i].won;
				vm.players[i].card = '';

				if (vm.players[i].name == playerToPlay) {
					vm.players[i].turn = true;
				} else {
					vm.players[i].turn = false;
				}
			}
		};

        function newMatchCB(players, playerToPlay) {
			//Updating player list
			for (let i in vm.players) {
				vm.players[i].lives = players[i].lives;
				vm.players[i].won = 0;
				vm.players[i].card = '';
				vm.players[i].bet = '-';

				if (vm.players[i].name == playerToPlay) {
					vm.players[i].turn = true;
				} else {
					vm.players[i].turn = false;
				}
			}

			//Updating cards
			socket.emit('request-cards', null, function(data) {
				vm.cards = data.cards;
				vm.matchNumber = vm.cards.length;

				vm.betOptions.length = 0;
				for (var i = 0; i < vm.matchNumber; i++) {
					vm.betOptions.push(i);
				}
				vm.betOptions.push(vm.matchNumber);
			});

			//Update phase and playerturn
			vm.phase = "bet";
		};

		function endGameCB(players) {
			//TODO better end game

			//Updating player list
			for (let i in vm.players) {
				vm.players[i].lives = players[i].lives;
				vm.players[i].won = 0;
				vm.players[i].card = '';
				vm.players[i].bet = '-';
				vm.players[i].ready = false;
			}

			//Ending game
			vm.isUp = false;
			vm.phase = false;
			vm.readyToStart = false;
		};
	};
})();
