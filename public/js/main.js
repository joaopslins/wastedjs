var fodinhaJS = angular.module ("fodinhaJSapp", ["ngAnimate", "ngSanitize"]);

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

fodinhaJS.controller("fodinhaJSctrl", function($scope, $timeout)
{
	//Local variables
	$scope.loggedIn = 'no';
	$scope.me = {
		name : "",
		ready : false,
		lives : 1,
		won : 2,
		bet : 0,
		card : ''
	}

	//login button function
	$scope.loginToggle = function()
	{
		// If logging in
		if($scope.loggedIn == "no")
		{
			// Animation
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "yes";
			}, 550);

			//Add new player
			// TODO USING NODE SERVER
			$scope.players.push($scope.me);

		}
		// If logging out
		else if($scope.loggedIn == "yes")
		{
			// Animation
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "no";
			}, 550);

			//Remove current player
			// TODO USING NODE SERVER
			$scope.players = $scope.players.filter(function (player)
			{
				return player != $scope.me;
			});
		}

		// Reset ready status
		$scope.me.ready = false;
	}

	// Ready button function
	$scope.readyToggle = function()
	{
		$scope.me.ready = !$scope.me.ready;
	}

	//Play card button function
	$scope.playCard = function()
	{
		//TODO play card function
	}

	//Aux Function
	$scope.cardIsRed = function(card)
	{
		return (card[1] == 'H' || card[1] == 'D');
	}

	$scope.cardSelect = function (index)
	{
		$scope.me.card = $scope.cards[index];
	}

	// Local player list
	$scope.players = [
	{
		name : "Teste1",
		ready : false,
		lives : 3,
		won : 2,
		bet : 0,
		card : "4C",
	},
	{
		name : "Teste2",
		ready : false,
		lives : 2,
		won : 2,
		bet : 0,
		card : "7H"
	}
	];

	// Local player card list
	$scope.cards = [
		"4S","5H","6C", "7D", "4H", "5C", "6D", "7S"
	];
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
