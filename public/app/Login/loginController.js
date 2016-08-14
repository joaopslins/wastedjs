(function() {
    'use strict';

    angular
        .module("wastedJSapp")
        .controller("loginController", loginCtrl);

    function loginCtrl ($location, socket) {
        var vm = this;
        var inProcess = false;

        //Local variables
        vm.name = '';
        vm.loginError = false;
        vm.loginErrorMessage = '';

        //Function Binds
        vm.loginToggle = loginToggle;

        activate();

        //////////////////////////////

        function activate() {
            if (socket.isConnected()) {
                socket.disconnect();
            }
        };

    	//login button function
    	function loginToggle() {
    		//Reset error status
    		vm.loginError = false;

            //Don't login with null name
        	if(vm.name == "") return;
            if (inProcess) return;
            inProcess = true;

            //Tries to login into server
            socket.connect();
            socket.emit('login', vm.name, function(success) {
                if (success == 0) {
                    //Redirect view
                    $location.url("/lobby");
                } else {
            		if (success == 1) {
            			vm.loginErrorMessage =  '<strong>Cannot login!</strong>'+
            										'<br />Nick was already taken!'
            		} else if(success == 2) {
            			vm.loginErrorMessage = 	'<strong>Cannot login!</strong>'+
            										'<br />Room is full!'
            		} else if(success == 3)	{
            			vm.loginErrorMessage = 	'<strong>Cannot login!</strong>'+
            										'<br />Room in game!'
            		}

            		vm.loginError = true;
                }

                inProcess = false;
            });
    	};
    };
})();
