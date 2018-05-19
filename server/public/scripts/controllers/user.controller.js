myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.progressVal = 0;

  var gDat = [
    {champ: "Shaco", lane : "Jungle", win: true},
    {champ: "Shaco", lane : "Jungle", win: false},
    {champ: "Shaco", lane : "Jungle", win: true},
    {champ: "Teemo", lane : "Jungle", win: false},
    {champ: "Ahri", lane : "Middle", win: true},
    {champ: "Teemo", lane : "Top", win: true},
    {champ: "Brand", lane : "Middle", win: false},
    {champ: "Ezreal", lane : "Bottom", win: false},
    {champ: "Shaco", lane : "Jungle", win: true},
    {champ: "Teemo", lane : "Middle", win: false},
  ]
  //////////////// TESTING
  function treeObj(name){
    this.name = name;
    this.children = [];
  }

  function buildObj(matchDataArray){
    console.log('matchDataArray is:', matchDataArray);
    var finalObj = new treeObj("Lane");
    var fObj = finalObj.children;

    matchDataArray.forEach((v,i)=>{
      var pMD = v.participants[getParticipantIndex(v)];  // player match data
      var lane = pMD.timeline.lane;
      var champ = pMD.champion;
      var win = pMD.stats.win;

      if(!fObj[lane]){
        fObj[lane] = new treeObj(lane);
      }
      var fObjChamps = finalObj.children[lane].children;
      if(!fObjChamps[champ]){
        fObjChamps[champ] = new treeObj(champ);
        fObjChamps[champ].children['Wins'] = {name: 'Wins', size: 0, children: []};
        fObjChamps[champ].children['Losses'] = {name: 'Losses', size: 0, children: []};
      }
      if(win){
        fObjChamps[champ].children['Wins'].size +=1;
      } else {
        fObjChamps[champ].children['Losses'].size +=1;
      }
    });
    console.log('finalObj is:', finalObj);
  }

  // buildObj();
  ///////////////////  END TESTING
  vm.doAll = function(name) {
    getPlayerAccount(name)
    .then(getMatches)
    .then(extractMatchIDs)
    .then(getMatchData)
    .then(getChampionNames)
    .then(buildObj);
  }

  function getChampionNames(matchData){
    return new Promise((resolve, reject)=>{
      $http.get('/getChampList').then( response => {
        var champList = response.data;
        matchData.forEach((v,i) =>{
          var pMD = v.participants[getParticipantIndex(v)];
          pMD.champion = champList[pMD.championId];
        });
        resolve(matchData);
      });
    });
  }

  function getPlayerAccount(name){ // gets summoner data
    vm.progressVal += 2;
    //console.log(`In getPlayerAccount with: ${name}`);
    return $http.get('/getSummonerID/' + name);
  };

  function getMatches(result){
    vm.progressVal += 3;
    vm.accountId = result.data.accountId;
    //console.log(`In getMatches with:`, result);
    return $http.get('/getMatches/' + vm.accountId);
  }

  function extractMatchIDs(result){
    vm.progressVal += 5;
    //console.log(`In extractMatchIDs with:`, result);
    var ids = result.data.matches;
    var matchIDs = [];
    for(i = 0; i < ids.length - 90; i++){ //// shortening matchIDs to avoid exceeding rate limits during development
      matchIDs.push(ids[i].gameId);
    }
    return matchIDs;
  }

  function getMatchData(matchIDs){
    //console.log(`In getMatchData with:`, matchIDs);
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

  function doThing(result) {
    console.log(`result is:`, result);
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
