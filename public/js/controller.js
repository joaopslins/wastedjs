wastedJS.controller("wastedJSctrl", function($scope, $timeout, $window, socket)
{
	//Local variables
	$scope.loginErrorMessage = "";
	$scope.readyToStart = false;
	$scope.firstPlayer = false;
	$scope.loginError = false;
	$scope.loggedIn = 'no';
	$scope.game = false;
	$scope.myTurn = false;
	$scope.phase = false;
	$scope.me = {
		name : "",
		ready : false,
		lives : 3,
		won : 0,
		bet : '-',
		card : ''
	};

	// Local player list
	$scope.players = [];

	// Local player card list
	$scope.cards = [];

	//Bet options
	$scope.betOptions = [];

	//login button function
	$scope.loginToggle = function()
	{
		//Reset error status
		$scope.loginError = false;

		if($scope.me.name == "") return;
		// If logging in
		if($scope.loggedIn == "no")
		{
			// Animation
			$scope.loggedIn = false;

			//Tries to login into server
			//		data = {playerList,success}
			socket.emit('login', $scope.me.name, function(data)
			{
				if(data.success == 0)
				{
					//Update local player list
					$scope.players = data.playerList;
					if($scope.players.length == 0){
						$scope.firstPlayer = true;
					}
					$scope.players.push($scope.me);

					//Login
					$timeout( function() {
						$scope.loggedIn = "yes";
					}, 550);
				}
				else
				{
					$timeout( function() {
						//Nick taken
						if(data.success == 1)
						{
							$scope.loginErrorMessage =  '<strong>Cannot login!</strong>'+
														'<br />Nick was already taken!'
						}
						//Room is full
						else if(data.success == 2)
						{
							$scope.loginErrorMessage = 	'<strong>Cannot login!</strong>'+
														'<br />Room is full!'
						}
						//In game
						else if(data.success == 3)
						{
							$scope.loginErrorMessage = 	'<strong>Cannot login!</strong>'+
														'<br />Room in game!'
						}

						$scope.loggedIn = "no";
						$scope.loginError = true;
					}, 550);
				}
			});
		}
		// If logging out
		else if($scope.loggedIn == "yes")
		{
			let exit = true;

			if($scope.game){
				if($window.confirm("This will end the game, are you sure?")){
					exit = true;
				}else{
					exit = false;
				}
			}

			if(exit)
			{
				// Animation
				$scope.loggedIn = false;
				$timeout( function() {
					$scope.loggedIn = "no";
				}, 550);

				//Logout from server and reset local player list
				socket.emit('logout');
				$scope.players = [];

				//Reset Player Configs
				$scope.me.name = "";
				$scope.me.ready = false;
				$scope.me.lives = 3;
				$scope.me.won = 0;
				$scope.me.bet = '-';
				$scope.me.card = '';

				$scope.firstPlayer = false;
				$scope.game = false;
			}
		}
	}

	// Ready button function
	$scope.readyToggle = function()
	{
		let aux = true;

		//Toggle ready variable
		$scope.me.ready = !$scope.me.ready;

		// Update to server
		socket.emit('ready', {
			name: $scope.me.name,
			ready: $scope.me.ready
		});

		//At least 2 players
		if($scope.players.length == 1)
		{
			aux = false;
		}

		//Check if everyone is ready
		for(i in $scope.players)
		{
			if(!$scope.players[i].ready)
			{
				aux = false;
			}
		}

		$scope.readyToStart = aux;
	}

	//Play card button function
	$scope.playCard = function()
	{
		if($scope.myTurn && $scope.phase == 'play' && $scope.me.card != ''){
			socket.emit('player-play-card', $scope.me.card);

			//Remove played card
			$scope.cards = $scope.cards.filter(function (c) {
				if (c == $scope.me.card) {
					return false;
				} else {
					return true;
				}
			});

			$scope.myTurn = false;
			$scope.me.card = '';
		}
	}

	$scope.betClick = function(index){
		bet = $scope.betOptions[index];

		socket.emit('player-bet', bet);
		$scope.myTurn = false;
		$scope.me.bet = bet;
	}

	//Simple function if card is red
	$scope.cardIsRed = function(card)
	{
		return (card[1] == 'H' || card[1] == 'D');
	}

	//Select card function
	$scope.cardSelect = function (index)
	{
		if ($scope.myTurn) {
			$scope.me.card = $scope.cards[index];
		}
	}

	//Start game - Only for host player
	$scope.startGame = function()
	{
		if($scope.readyToStart)
		{
			socket.emit('start-game');
		}
	}

	//Socket listener events
	socket.on('player-connect', function(newPlayer)
	{
		$scope.players.push(newPlayer);

		$scope.readyToStart = false;
	});

	socket.on('player-disconnect', function(dcName)
	{
		$scope.players = $scope.players.filter(function(player) {
			return player.name != dcName;
		});

		if ($scope.players[0].name == $scope.me.name) {
			$scope.firstPlayer = true;
		}

		$scope.readyToStart = false;

		//If ongoing game
		if ($scope.game) {
			$scope.game = false;
			$scope.me.ready = false;
		}
	});

	socket.on('update-client-ready', function(client)
	{
		let aux = true;
		for(i in $scope.players)
		{
			//Update player ready in local player list
			if ($scope.players[i].name == client.name)
			{
				$scope.players[i].ready = client.ready;
			}

			//Check if everyone is ready
			if(!$scope.players[i].ready)
			{
				aux = false;
			}
		}

		//At least 2 players
		if($scope.players.length == 1)
		{
			aux = false;
		}

		$scope.readyToStart = aux;
	});

	socket.on('game-start-notification', function(playerToPlay){
		socket.emit('request-cards', null, function(data){
			$scope.cards = data.cards;
			$scope.matchNumber = $scope.cards.length;

			$scope.betOptions.length = 0;
			for(var i = 0; i < $scope.matchNumber; i++){
				$scope.betOptions.push(i);
			}
			$scope.betOptions.push($scope.matchNumber);
		});

		//Set flags
		$scope.game = true;
		$scope.phase = "bet";

		//Reset Players Config
		for (let i in $scope.players){
			$scope.players[i].lives = 3;
			$scope.players[i].won = 0;
			$scope.players[i].bet = '-';
			$scope.players[i].card = '';
		}

		//Set turn
		if (playerToPlay == $scope.me.name) {
			$scope.myTurn = true;
		} else {
			$scope.myTurn = false;
		}
	});

	socket.on('bet-update', function(bet, playerWhoBet, nextPlayer, startPlayPhase){
		//Updates bet locally
		for (let i in $scope.players){
			if($scope.players[i].name == playerWhoBet){
				$scope.players[i].bet = bet;
				break;
			}
		}

		//Set turn
		if ($scope.me.name == nextPlayer) {
			$scope.myTurn = true;

			//Check if it's last player
			let isLast = true;
			for (let i in $scope.players) {
				//If there is a player who didn't bet and is alive, is not last
				if ($scope.players[i].name != $scope.me.name && $scope.players[i].bet == '-' && $scope.players[i].lives > 0) {
					isLast = false;
					break;
				}
			}

			//Check which bet is blocked
			if (isLast) {
				let betSum = 0;
				for (let i in $scope.players) {
					if ($scope.players[i].name != $scope.me.name && $scope.players[i].lives > 0) {
						betSum += $scope.players[i].bet;
					}
				}

				let cantBet = $scope.matchNumber - betSum;

				$scope.betOptions = $scope.betOptions.filter(function(iBet) {
					if  (iBet != cantBet) {
						return true;
					} else {
						return false;
					}
				});
			}
		} else {
			$scope.myTurn = false;
		}

		//Change phase to play
		if (startPlayPhase) {
			$scope.phase = "play";
		}
	});

	socket.on('play-update', function (card, playerWhoPlayed, nextPlayer) {
		//Update Card locally
		for (let i in $scope.players) {
			if ($scope.players[i].name == playerWhoPlayed) {
				$scope.players[i].card = card;
				break;
			}
		}

		//Set next turn
		if ($scope.me.name == nextPlayer) {
			$scope.myTurn = true;
		} else {
			$scope.myTurn = false;
		}
	});

	socket.on('new-round', function (players, playerToPlay){
		//Updating player list
		for (let i in $scope.players) {
			$scope.players[i].won = players[i].won;
			$scope.players[i].card = '';
		}

		//Set next turn
		if ($scope.me.name == playerToPlay) {
			$scope.myTurn = true;
		} else {
			$scope.myTurn = false;
		}
	});

	socket.on('new-match', function (players, playerToPlay) {
		//Updating player list
		for (let i in $scope.players) {
			$scope.players[i].lives = players[i].lives;
			$scope.players[i].won = 0;
			$scope.players[i].card = '';
			$scope.players[i].bet = '-';
		}

		//Updating cards
		socket.emit('request-cards', null, function(data){
			$scope.cards = data.cards;
			$scope.matchNumber = $scope.cards.length;

			$scope.betOptions.length = 0;
			for(var i = 0; i < $scope.matchNumber; i++){
				$scope.betOptions.push(i);
			}
			$scope.betOptions.push($scope.matchNumber);
		});

		//Update phase and playerturn
		$scope.phase = "bet";

		if ($scope.me.name == playerToPlay) {
			$scope.myTurn = true;
		} else {
			$scope.myTurn = false;
		}
	});

	socket.on('end-game', function (players) {
		//TODO better end game

		//Updating player list
		for (let i in $scope.players) {
			$scope.players[i].lives = players[i].lives;
			$scope.players[i].won = 0;
			$scope.players[i].card = '';
			$scope.players[i].bet = '-';
			$scope.players[i].ready = false;
		}

		//Ending game
		$scope.game = false;
		$scope.phase = false;
		$scope.readyToStart = false;
	});

	socket.on('reset', function() {
		$scope.loginErrorMessage = "";
		$scope.readyToStart = false;
		$scope.firstPlayer = false;
		$scope.loginError = false;
		$scope.loggedIn = 'no';
		$scope.game = false;
		$scope.myTurn = false;
		$scope.phase = false;

		$scope.me = {
			name : "",
			ready : false,
			lives : 3,
			won : 0,
			bet : '-',
			card : ''
		};

		// Local player list
		$scope.players = [];

		// Local player card list
		$scope.cards = [];

		//Bet options
		$scope.betOptions = [];
	});
});
