myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.nameEntered = false;

getMatches = function(id){
  console.log('in getMatches with:', id);

  $http.get('/getMatches/' + id).then(function(response){
        console.log('got response data:', response.data);
        vm.matches = response.data.matches;
        console.log('Matches:', vm.matches);
      });

};


vm.setSummoner = function(name){
  console.log('in setSummoner with:', name);

  $http.get('/getSummonerID/' + name).then(function(response){
        console.log(response.data);
        vm.nameEntered = true;
        vm.summoner = name;
        vm.accountID = response.data.accountId;
        getMatches(vm.accountID);
      });


};

});
