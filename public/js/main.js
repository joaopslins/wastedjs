var fodinhaJS = angular.module ("fodinhaJSapp", ["ngAnimate"]);

// TODO - CARDS

fodinhaJS.controller("fodinhaJSctrl", function($scope, $timeout)
{
	$scope.loggedIn = 'no';
	$scope.me = {
		name : "",
		ready : false,
		lives : 1,
		won : 2,
		bet : 0

	}

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

	$scope.readyToggle = function()
	{
		$scope.me.ready = !$scope.me.ready;
	}

	$scope.players = [
	{
		name : "Teste1",
		ready : false,
		lives : 3,
		won : 2,
		bet : 0,
	},
	{
		name : "Teste2",
		ready : false,
		lives : 2,
		won : 2,
		bet : 0,
	}
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
