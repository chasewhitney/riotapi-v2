myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.nameEntered = false;


// vm.getStuff = function(){
//     console.log('in getStuff');
//     $http.get('/getStuff').then(function(response){
//       console.log(response);
//
//     });
//
//   };
//
// vm.getStuff();

vm.setSummoner = function(name){
  console.log('in setSummoner with:', name);

  $http.get('/getSummonerID/' + name).then(function(response){
        console.log(response.data);
        vm.nameEntered = true;
        vm.summoner = name;
        vm.accountID = response.data.accountId;
      });


};

});
