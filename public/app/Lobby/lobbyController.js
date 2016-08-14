(function() {
    angular
    	.module("wastedJSapp")
		.controller("lobbyController", lobbyCtrl);

	function lobbyCtrl($location, lobbyService, socket) {
        var vm = this;

		//Model variables
		vm.readyToStart = false;
		vm.firstPlayer = false;
		vm.name = '';

		// Model player list
		vm.players = [];

        //Function Binds
        vm.logoutButton = logoutButton;
        vm.readyButton = readyButton;
        vm.startGame = startGame;

        //Socket listener events
		socket.on('player-connect', playerConnectCB);
        socket.on('player-disconnect', playerDisconnectCB);
        socket.on('update-client-ready', updateClientReadyCB);
        socket.on('game-start-notification', gameStartNotificationCB);

        activate();

        //////////////////////////////

        function activate () {
            //Getting players and name
            socket.emit('request-playerlist', null, function (data) {
                lobbyService.setPlayers(data);
                vm.name = data.name;
                vm.players = data.playerList;

                if (vm.players.length == 1) {
                    vm.firstPlayer = true;
                }
            });
        }

        //////////////////////////////
        // Function Implementations //
        //////////////////////////////

		function logoutButton() {
			//Disconnect
			socket.disconnect();

			//Redirect
			$location.url("/");
		};

		function readyButton() {
            //Update model
            vm.readyToStart = lobbyService.toggleReady();
            vm.players = lobbyService.getPlayers();

			// Update to server
			socket.emit('ready', {
				"name": vm.name,
				"ready": lobbyService.getReady()
			});
		};

		//Start game - Only for host player
		function startGame() {
			if (vm.readyToStart) {
				socket.emit("start-game");
			}
		};

        ///////////////////////////////
        // Socket listener callbacks //
        ///////////////////////////////

        function playerConnectCB(newPlayer) {
            lobbyService.addPlayer(newPlayer);

            vm.readyToStart = false;
            updatePlayerModel();
		};

		function playerDisconnectCB(dcName) {
            vm.firstPlayer = lobbyService.removePlayer (dcName)
			vm.readyToStart = false;
            updatePlayerModel();
		};

		function updateClientReadyCB(player) {
			vm.readyToStart = lobbyService.updateReadyForPlayer(player);
            updatePlayerModel();
		};

		function gameStartNotificationCB(startingPlayer) {
            lobbyService.startGame(startingPlayer);

			$location.url("/game");
		};

        /////////////////////////////
        //    Utility Functions    //
        /////////////////////////////

        function updatePlayerModel() {
            vm.players = lobbyService.getPlayers();
        }
	};
})();
