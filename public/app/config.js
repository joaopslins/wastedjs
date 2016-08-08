(function() {
    angular
        .module("wastedJSapp")
        .config(route);

    function route ($routeProvider, $locationProvider) {
        $routeProvider
          .when('/', {
            templateUrl: 'app/Login/_login.html',
            controller: 'loginController',
          })
          .when('/game', {
            templateUrl: 'app/Game/_game.html',
            controller: 'gameController',
          });

        $locationProvider.html5Mode(true);
    };
})();
