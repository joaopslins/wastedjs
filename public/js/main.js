var fodinhaJS = angular.module ("fodinhaJSapp", ["ngAnimate", "ngSanitize"]);

// From http://briantford.com/blog/angular-socket-io
fodinhaJS.factory("socket", function ($rootScope) {
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

fodinhaJS.filter('cardFilter', function($sce)
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

fodinhaJS.controller("fodinhaJSctrl", function($scope, $timeout, socket)
{
	//Local variables
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
		if($scope.me.name == "") return;
		// If logging in
		if($scope.loggedIn == "no")
		{
			// Animation
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "yes";
			}, 550);

			//Login into server
			socket.emit('login', $scope.me.name, function(playerList)
			{
				//Update local player list
				$scope.players = playerList;
				$scope.players.push($scope.me);
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
			$scope.me.name = "",
			$scope.me.ready = false,
			$scope.me.lives = 3,
			$scope.me.won = 0,
			$scope.me.bet = 0,
			$scope.me.card = ''
		}
	}

	// Ready button function
	$scope.readyToggle = function()
	{
		//Toggle ready variable
		$scope.me.ready = !$scope.me.ready;
		
		// Update to server
		socket.emit('ready', {
			name: $scope.me.name,
			ready: $scope.me.ready
		});
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

	//Socket listener events
	socket.on('playerConnect', function(newPlayer){
		$scope.players.push(newPlayer);
	});

	socket.on('playerDisconnect', function(dcName)
	{
		$scope.players = $scope.players.filter(function(player)
		{
			return player.name != dcName;
		});
	});
	
	socket.on('updateClientReady', function(client)
	{
		//Update player ready in local player list
		for(i in $scope.players)
		{
			if ($scope.players[i].name == client.name)
			{
				$scope.players[i].ready = client.ready;
			}
		}
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
