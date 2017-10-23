myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;

});
