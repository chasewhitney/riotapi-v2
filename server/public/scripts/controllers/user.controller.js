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

  function buildObj(){
    var finalObj = new treeObj("Lane");

    gDat.forEach((gv,gi)=>{
      if(!finalObj.children[gv.lane]){
        finalObj.children[gv.lane] = new treeObj(gv.lane);
      }
      if(!finalObj.children[gv.lane].children[gv.champ]){
        finalObj.children[gv.lane].children[gv.champ] = new treeObj(gv.champ);
        finalObj.children[gv.lane].children[gv.champ].children['Wins'] = {name: 'Wins', size: 0, children: []};
        finalObj.children[gv.lane].children[gv.champ].children['Losses'] = {name: 'Losses', size: 0, children: []};
      }
      if(gv.win){
        finalObj.children[gv.lane].children[gv.champ].children['Wins'].size +=1;
      } else {
        finalObj.children[gv.lane].children[gv.champ].children['Losses'].size +=1;
      }
    });
    console.log(finalObj);
  }
  buildObj();
  ///////////////////  END TESTING
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
    console.log('------------');

    result.forEach((v,i)=>{
      var pMD = v.participants[getParticipantIndex(v)]; // player match data

      console.log(pMD.championId);

      console.log(pMD.timeline.lane); //NONE if game ends before 20

      console.log(pMD.timeline.role);
      console.log((v.gameDuration / 60) + ' min');
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
