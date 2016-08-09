// From http://briantford.com/blog/angular-socket-io
(function() {
	angular
        .module("wastedJSapp")
		.factory("socket", socket);

	function socket ($rootScope) {
		var socket = null;

		return {
			connect: function() {
				socket = io.connect();
			},
			disconnect: function() {
				socket.disconnect();
				socket = null;
			},
			isConnected: function() {
				if (socket) {
					return true;
				} else {
					return false;
				}
			},
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
	};
})();
