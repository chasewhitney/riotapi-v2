myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.nameEntered = false;
  vm.matchData = [];
  vm.userService.loading = false;

/// GET TEST DATA

  // var requestURL = 'https://raw.githubusercontent.com/ChaseWhitney/riotapi/master/testData.json';
  //   var request = new XMLHttpRequest();
  //   request.open('GET', requestURL);
  //   request.responseType = 'json';
  //   request.send();
  //   var testData = {};
  //   request.onload = function() {
  //     testData = request.response.data;
  //     console.log('testData typeof:', typeof testData);
  //     console.log('testData is:', testData);
  //     console.log('testData[0].gameId is:', testData[0].gameId);
  //     vm.userService.matchData = testData;
  //     console.log('vm.userService.matchData is:', vm.userService.matchData);
  //     vm.userService.accountID = 216577959;
  //   };

/// END GET TEST DATA

/// GET CHAMP DATA

var requestURL2 = 'https://raw.githubusercontent.com/AlecSands/lol_data_experiment/master/data/data.json';
var request2 = new XMLHttpRequest();
request2.open('GET', requestURL2);
request2.responseType = 'json';
request2.send();
vm.userService.champData = {};
request2.onload = function() {
  vm.userService.champData = request2.response;
  console.log('vm.userService.champData is:', vm.userService.champData);
  vm.userService.buildChampionList();
};

/// END GET CHAMP DATA

  getMatches = function(id){ // gets list of recent matches
    console.log('in getMatches with:', id);
    $http.get('/getMatches/' + id).then(function(response){
      console.log('got response data:', response.data);
      vm.matches = response.data.matches;
      vm.userService.matches = angular.copy(vm.matches);
      console.log('Matches:', vm.matches);
      console.log('Service Matches:', vm.userService.matches);
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
      vm.userService.accountID = response.data.accountId;
      vm.userService.loading = true;
      getMatches(vm.userService.accountID);
      setTimeout(vm.getMatchData, 500);
      setTimeout(function(){vm.userService.extractPlayerData(vm.userService.matchData);}, 2500);
      setTimeout(function(){vm.userService.buildDataObject(vm.userService.relData);}, 3000);
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
        vm.userService.matchData = vm.matchData;
      });
    }
  };

// vm.writeData = function(){
//   $http.get('/writeData').then(function(response){
//     console.log('got response from writeData:', response.data);
//   });
// };

  vm.test = function(){
    console.log('in test');
    console.log('vm.loading is:', vm.loading);
  };

});
