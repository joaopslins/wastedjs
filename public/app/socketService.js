// From http://briantford.com/blog/angular-socket-io
(function() {
	'use strict';

	angular
        .module("wastedJSapp")
		.factory("socket", socket);

	function socket ($rootScope) {
		var socket = null;

		var socketService = {
			connect: connect,
			disconnect: disconnect,
			isConnected: isConnected,
			on: on,
			emit: emit
		};

		return socketService;

		///////////////////

		function connect() {
			socket = io.connect();
		};

		function disconnect() {
			socket.disconnect();
			socket = null;
		};

		function isConnected() {
			if (socket) {
				return true;
			} else {
				return false;
			}
		};

		function on(eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		};

		function emit(eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		};
	};
})();
