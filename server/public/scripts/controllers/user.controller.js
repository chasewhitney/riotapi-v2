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
    .then(getMatchData)
    .then(doThing);


    // console.log('response is:', $http.get('/getMatchData/' + 2634798282));
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
    console.log('result is:', result);
    var ids = result.data.matches;
    console.log('ids is:', ids);
    console.log('ids length:', ids.length);
    var matchIDs = [];
    for(i = 0; i < ids.length - 90; i++){ //// shortening matchIDs to avoid exceeding rate limits while developing
          matchIDs.push(ids[i].gameId);
    }
    return matchIDs;
  }

  function getMatchData(matchIDs){
    return new Promise((resolve, reject)=>{
      var matchData = [];
      console.log('matchIDs is:', matchIDs);
      for(var i = 0; i < matchIDs.length; i++){
        $http.get('/getMatchData/' + matchIDs[i]).then(function(response){
          matchData.push(response.data);
          if(matchData.length == matchIDs.length){
            console.log('returning:', matchData);
            resolve(matchData);
          }
        });
      }
    });
  };

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
