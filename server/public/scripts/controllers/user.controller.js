myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.progressVal = 0;

  vm.doAll = function(name) {
    getPlayerAccount(name)
    .then(getMatches)
    .then(extractMatchIDs)
    .then(getMatchData)
    .then(doThing);
  }

  function getPlayerAccount(name){ // gets summoner data
    vm.progressVal += 2;
    console.log(`In getPlayerAccount with: ${name}`);
    return $http.get('/getSummonerID/' + name);
  };

  function getMatches(result){
    vm.progressVal += 3;
    vm.accountId = result.data.accountId;
    console.log(`In getMatches with:`, result);
    return $http.get('/getMatches/' + vm.accountId);
  }

  function extractMatchIDs(result){
    vm.progressVal += 5;
    console.log(`In extractMatchIDs with:`, result);
    var ids = result.data.matches;
    var matchIDs = [];
    for(i = 0; i < ids.length - 90; i++){ //// shortening matchIDs to avoid exceeding rate limits during development
      matchIDs.push(ids[i].gameId);
    }
    return matchIDs;
  }

  function getMatchData(matchIDs){
    console.log(`In getMatchData with:`, matchIDs);
    return new Promise((resolve, reject)=>{
      var matchData = [];
      for(var i = 0; i < matchIDs.length; i++){
        $http.get('/getMatchData/' + matchIDs[i]).then(function(response){
          matchData.push(response.data);
          vm.progressVal += 9;
          if(matchData.length == matchIDs.length){
            vm.progressVal = 0;
            resolve(matchData);
          }
        });
      }
    });
  };

  ///NEED lane, champ, win/loss

  //participantID: result.participantIdentities[index].participantId .player.accountId
  //lane:
  //champ:
  //win/loss:

  function doThing(result) {
    console.log(`result is:`, result);


    result.forEach((v,i)=>{
      var pMD = v.participants[getParticipantIndex(v)]; // player match data
      //pMD.timeline.lane
      console.log('------------');
      console.log(pMD.timeline.lane);
      //pMd.championId
      console.log(pMD.championId);
      //pMD.stats.win
      console.log(pMD.timeline.role);
      console.log('------------');
    })

    return 1;
  }

  function getParticipantIndex(item){
    for(let i = 0; i < item.participantIdentities.length; i++){
      if(item.participantIdentities[i].player.accountId == vm.accountId){
        return i;
      }
    }
  }

});
