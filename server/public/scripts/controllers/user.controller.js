myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;

  // vm.doAll = function(name) {
  //   console.log('in doAll');
  //   new Promise((resolve, reject) =>{var summoner = getSummoner(name); resolve(summoner);})
  //   .then((result) => {console.log('vm.summoner1:', vm.summoner);});
  // }

  vm.doAll = function(name) {
    getSum(name)
    .then(getMatches)
    .then(extractMatchIDs)
    .then(doThing);
  }


  function getSummoner(name){ // gets summoner data
    console.log('in setSummoner with:', name);
    $http.get('/getSummonerID/' + name).then(function(response){
      console.log('got summoner ID:', response.data);
      vm.summoner = response.data;

    });
  };

  function getSum(name){ // gets summoner data
    return $http.get('/getSummonerID/' + name);
  };

  function getMatches(result){
    console.log('in getMatches with:', result);
    return $http.get('/getMatches/' + result.data.accountId);
  }

  function extractMatchIDs(result){
    var ids = result.data.matches;
    var matchIDs = [];
    for(i = 0; i < ids.length; i++){
          matchIDs.push(ids[i].gameId);
    }
    return matchIDs;
  }


  function doThing(result) {
    console.log('result is:', result);
    return 1;
  }


});





// var requestURL2 = 'https://raw.githubusercontent.com/AlecSands/lol_data_experiment/master/data/data.json';
// var request2 = new XMLHttpRequest();
// request2.open('GET', requestURL2);
// request2.responseType = 'json';
// request2.send();
// vm.userService.champData = {};
// request2.onload = function() {
//   var obj = request2.response;
//   console.log('typeof:', typeof obj);
//   console.log('obj is:', obj);
//   var obj2 = obj.keys;
//   console.log('obj2 is:', obj2);
//   $http.post('/champData', obj2).then(response => {console.log('response:', response);});
//   }
