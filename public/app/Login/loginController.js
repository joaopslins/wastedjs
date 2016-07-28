wastedJS.controller("loginController", function($scope, $timeout, $location, socket)
{
	//Local variables
    $scope.name = '';
    $scope.loginError = false;
    $scope.loginErrorMessage = '';

    if (socket.isConnected()) {
        socket.disconnect();
    }

	//login button function
	$scope.loginToggle = function()
	{
		//Reset error status
		$scope.loginError = false;

        //Don't login with null name
    	if($scope.name == "") return;

        //Tries to login into server
        socket.connect();
        socket.emit('login', $scope.name, function(success)
        {
            if(success == 0) {
                //Redirect view
                $location.url("/game");
            } else {
            	$timeout( function() {
            		//Nick taken
            		if (success == 1) {
            			$scope.loginErrorMessage =  '<strong>Cannot login!</strong>'+
            										'<br />Nick was already taken!'
            		} else if(success == 2) {
            			$scope.loginErrorMessage = 	'<strong>Cannot login!</strong>'+
            										'<br />Room is full!'
            		} else if(success == 3)	{
            			$scope.loginErrorMessage = 	'<strong>Cannot login!</strong>'+
            										'<br />Room in game!'
            		}

            		$scope.loginError = true;
            	}, 550);
            }
        });
	}
});
