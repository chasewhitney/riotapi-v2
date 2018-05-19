myApp.controller('UserController', function(UserService, $http, $location, $mdDialog) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.progressVal = 0;


  //////////////// TESTING

  ///////////////////  END TESTING

  vm.doAll = function(name) {
    getPlayerAccount(name) // Get player account ID
    .then(getMatches) // Get match IDs for recently played games
    .then(extractMatchIDs) // Pull match IDs from game data and put into an array
    .then(getMatchData) // Get full match data for each match ID in array
    .then(getChampionNames) // Add played champion name to match data based on provided championId
    .then(buildObj); // Build sunburst object based on provided match data
  }

  function treeObj(name){
    this.name = name;
    this.children = [];
  }

  function buildObj(matchDataArray){ // Builds sunburst object from match data
    console.log('matchDataArray is:', matchDataArray);
    var finalObj = new treeObj("Lane");
    var fObj = finalObj.children;

    matchDataArray.forEach((v,i)=>{
      var pMD = v.participants[getParticipantIndex(v)];  // Player's match data
      var lane = pMD.timeline.lane; // Lane player played inspect
      var champ = pMD.champion; // Champion played
      var win = pMD.stats.win; // Won or lost the match

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

  function getPlayerAccount(name){ // Gets player account information, including account ID
    vm.progressVal += 2;
    //console.log(`In getPlayerAccount with: ${name}`);
    return $http.get('/getSummonerID/' + name);
  };

  function getMatches(result){ // Gets basic info from player's last 100 matches
    vm.progressVal += 3;
    vm.accountId = result.data.accountId;
    //console.log(`In getMatches with:`, result);
    return $http.get('/getMatches/' + vm.accountId);
  }

  function extractMatchIDs(result){ // Gets match IDs from basic match info
    vm.progressVal += 5;
    //console.log(`In extractMatchIDs with:`, result);
    var ids = result.data.matches;
    var matchIDs = [];
    for(i = 0; i < ids.length - 90; i++){ //// shortening matchIDs to avoid exceeding rate limits during development
      matchIDs.push(ids[i].gameId);
    }
    return matchIDs;
  }

  function getMatchData(matchIDs){ // Gets full match data pertaining to each match ID
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

  function getParticipantIndex(item){ // Finds correct player in array of all players in match
    for(let i = 0; i < item.participantIdentities.length; i++){
      if(item.participantIdentities[i].player.accountId == vm.accountId){
        return i;
      }
    }
  }

});
