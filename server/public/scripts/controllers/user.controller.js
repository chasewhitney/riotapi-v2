myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.nameEntered = false;
  vm.matchData = [];

  getMatches = function(id){ // gets list of recent matches
    console.log('in getMatches with:', id);
    $http.get('/getMatches/' + id).then(function(response){
      console.log('got response data:', response.data);
      vm.matches = response.data.matches;
      console.log('Matches:', vm.matches);
    });
  };

  getMatchIDs = function(){ // creates any array of matchIDs
    console.log('in getMatchIDs with:', vm.matches);
    var ids = [];
    for(i = 0; i < vm.matches.length; i++){
      ids.push(vm.matches[i].gameId);
    }
    console.log('ids is:', ids);
    return ids;
  };


  vm.setSummoner = function(name){ // gets summoner data
    console.log('in setSummoner with:', name);
    $http.get('/getSummonerID/' + name).then(function(response){
      console.log(response.data);
      vm.nameEntered = true;
      vm.summoner = name;
      vm.accountID = response.data.accountId;
      getMatches(vm.accountID);
    });
  };

  vm.getMatchData = function(){ // gets match data for each recently played match
    console.log('in getMatchData with:', vm.matches);
    var matchIDs = getMatchIDs(vm.matches);
    console.log('matchIDs is:', matchIDs);
    for(var i = 0; i < matchIDs.length; i++){
      $http.get('/getMatchData/' + matchIDs[i]).then(function(response){
        // console.log(response.data);
        vm.matchData.push(response.data);
        console.log('vm.matchData is:', vm.matchData);
      });
    }
  };
vm.writeData = function(){
  $http.get('/writeData').then(function(response){
    console.log('got response from writeData:', response.data);

  });

};
});
