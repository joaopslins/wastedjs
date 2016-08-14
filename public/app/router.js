(function() {
    angular
        .module("wastedJSapp")
        .config(route);

    function route ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/Login/_login.html',
                controller: 'loginController',
                controllerAs: 'login'
            })
            .when('/lobby', {
                templateUrl: 'app/Lobby/_lobby.html',
                controller: 'lobbyController',
                controllerAs: 'lobby'
            })
            .when('/game', {
                templateUrl: 'app/Game/_game.html',
                controller: 'gameController',
                controllerAs: 'game'
            });

        $locationProvider.html5Mode(true);
    };
})();
