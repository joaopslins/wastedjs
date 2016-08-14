(function() {
    angular
    	.module("wastedJSapp")
		.controller("gameController", gameCtrl);

	function gameCtrl($location, gameService, socket) {
        var vm = this;

		//Local variables
		vm.phase = false;
		vm.me = null;

		// Local arrays
		vm.players = [];
		vm.cards = [];
		vm.betOptions = [];

        //Function Binds
        vm.playCard = playCard;
        vm.betClick = betClick;
        vm.cardIsRed = cardIsRed;
        vm.cardSelect = cardSelect;

        //Socket listener events
        socket.on('player-disconnect', playerDisconnectCB);
        socket.on('bet-update', betUpdateCB);
        socket.on('play-update', playUpdateCB);
        socket.on('new-round', newRoundCB);
        socket.on('new-match', newMatchCB);
        socket.on('end-game', endGameCB);

        activate();

        //////////////////////////////

        function activate () {
            gameService.updateData();

            vm.players = gameService.getPlayerlist();
            vm.me = gameService.getMe();
            vm.phase = "bet";

			socket.emit('request-cards', null, function(data) {
                gameService.setMatchNumber(data.cards.length);
				vm.cards = data.cards;
				vm.betOptions = gameService.generateBetOptions();
			});
        }

        //////////////////////////////
        // Function Implementations //
        //////////////////////////////

		//Play card button function
		function playCard() {
			if (vm.me.turn && vm.phase == 'play' && vm.me.card != '') {
				socket.emit('player-play-card', vm.me.card);

				//Remove played card
				vm.cards = vm.cards.filter(playedCardFilter);

                //Set next
				vm.me.turn = false;
				vm.me.card = '';
			}
		};

		function betClick(index) {
			socket.emit('player-bet', vm.betOptions[index]);

            vm.me.bet = vm.betOptions[index];
			vm.me.turn = false;
		};

		//Simple function if card is red
		function cardIsRed(card) {
			return (card[1] == 'H' || card[1] == 'D');
		};

		//Select card function
		function cardSelect(index) {
			if (vm.me.turn && vm.phase == 'play') {
				vm.me.card = vm.cards[index];
			}
		};

        ///////////////////////////////
        // Socket listener callbacks //
        ///////////////////////////////

		function playerDisconnectCB() {
            $location.url("/lobby");
		};

		function betUpdateCB(data) {
			//Updates bet locally and set turn
            vm.players = gameService.betTurn(data);

			//Set bets
			if (vm.me.turn) {
                vm.betOptions = gameService.updateBetOptions();
			}

			//Change phase to play
			if (data.startPlayPhase) {
				vm.phase = "play";
			}
		};

		function playUpdateCB (data) {
			//Update Card and turn locally
            vm.players = gameService.cardTurn(data)
		};

        function newRoundCB(data) {
            vm.players = gameService.newRoundUpdate(data);
		};

        function newMatchCB(data) {
			//Updating player list
            vm.players = gameService.newMatchUpdate(data);

			//Updating cards
			socket.emit('request-cards', null, function(requestData) {
                gameService.setMatchNumber(requestData.cards.length);
				vm.cards = requestData.cards;
				vm.betOptions = gameService.generateBetOptions();
			});

			//Update phase and playerturn
			vm.phase = "bet";
		};

		function endGameCB(players) {
			//TODO better end game

            $location.url("/lobby");

			//Ending game
			vm.phase = false;
		};

        /////////////////////////////
        //    Utility Functions    //
        /////////////////////////////

        function playedCardFilter(c) {
            if (c == vm.me.card) {
                return false;
            } else {
                return true;
            }
        }
	};
})();
