var wastedJS = angular.module ("wastedJSapp", ["ngAnimate", "ngSanitize"]);

// From http://briantford.com/blog/angular-socket-io
wastedJS.factory("socket", function ($rootScope) {
	var socket = io.connect();

	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});

wastedJS.filter('cardFilter', function()
{
	return function(input){
		var result = "";
		if(input == "") return "&#x1F0A0"

		switch (input[1]){
			case 'S':
				result = "&#x1F0A";
				break;
			case 'H':
				result = "&#x1F0B";
				break;
			case 'C':
				result = "&#x1F0D";
				break;
			case 'D':
				result = "&#x1F0C";
				break;
			default:
				result = "&#1F0A0";
		}

		switch(input[0]){
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
				result += input[0];
				break;
			case 'Q':
				result += "D";
				break;
			case 'J':
				result += "B";
				break;
			case 'K':
				result += "E";
				break;
			case 'A':
				result += "1";
				break;
			default:
				break;
		}

		return result;
	};
});

wastedJS.controller("wastedJSctrl", function($scope, $timeout, $sce, socket)
{
	//Local variables
	$scope.loginErrorMessage = "";
	$scope.readyToStart = false;
	$scope.firstPlayer = false;
	$scope.loginError = false;
	$scope.loggedIn = 'no';
	$scope.me = {
		name : "",
		ready : false,
		lives : 3,
		won : 0,
		bet : 0,
		card : ''
	}

	// Local player list
	$scope.players = [
	];

	// Local player card list
	$scope.cards = [
		"4S","5H","6C", "7D", "4H", "5C", "6D", "7S"
	];

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

						$scope.loggedIn = "no";
						$scope.loginError = true;
					}, 550);
				}
			});
		}
		// If logging out
		else if($scope.loggedIn == "yes")
		{
			// Animation
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "no";
			}, 550);

			//Logout from server and reset local player list
			socket.emit('logout', $scope.me.name);
			$scope.players = [];

			//Reset Player Configs
			$scope.me.name = "";
			$scope.me.ready = false;
			$scope.me.lives = 3;
			$scope.me.won = 0;
			$scope.me.bet = 0;
			$scope.me.card = '';

			$scope.firstPlayer = false;
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
		//TODO play card function
	}

	//Simple function if card is red
	$scope.cardIsRed = function(card)
	{
		return (card[1] == 'H' || card[1] == 'D');
	}

	//Select card function
	$scope.cardSelect = function (index)
	{
		$scope.me.card = $scope.cards[index];
	}

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
		$scope.players = $scope.players.filter(function(player)
		{
			return player.name != dcName;
		});

		if($scope.players[0].name == $scope.me.name)
		{
			$scope.firstPlayer = true;
		}

		$scope.readyToStart = false;
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
});

// $(function() {
// 	var $button = $("#button");
//
// 	var socket = io(window.location.host);
//
// 	$button.click( function()
// 	{
// 		socket.emit('send message');
// 	});
//
// 	socket.on('update message', function(data)
// 	{
// 		$message.text(data);
// 	});
// });
