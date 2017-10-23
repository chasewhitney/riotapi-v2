var myApp = angular.module('myApp', ['ngMaterial','ngMessages','ngRoute', 'ngMap', 'xeditable']);

/// Routes ///
myApp.config(function($routeProvider, $locationProvider, $mdIconProvider) {
  $locationProvider.hashPrefix('');
  console.log('myApp -- config');
  $routeProvider
    .when('/home', {
      templateUrl: '/views/templates/home.html',
      controller: 'UserController as uc',
    })
    .otherwise({
      redirectTo: 'home'
    });
});
