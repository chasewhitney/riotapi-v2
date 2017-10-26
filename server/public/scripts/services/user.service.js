myApp.factory('UserService', function($http, $location){
  console.log('UserService Loaded');

  var uv = {};
  uv.typeList = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];
  uv.champList = [];

  compressRelData = function(data){
    for(var b = 0; b < data.length; b++){
      data[b].wins = 0;
      data[b].losses = 0;
      if(data[b].win){
        data[b].wins +=1;
      } else{
        data[b].losses +=1;
      }
    }

    var newData = [];

    for(var i = 0; i < data.length; i++){
      var x = 0;
      for(p = 0; p < newData.length; p++){
        if(data[i].champName == newData[p].champName && data[i].lane == newData[p].lane){
          x++;
          if(data[i].win){
            newData[p].wins +=1;
          } else{
            newData[p].losses +=1;
          }
        }
      }
      if(x == 0){
        newData.push(data[i]);
      }
    }
    return newData;
  };

  buildDataTree = function(data, lolObj){

    for(var i = 0; i < data.length; i++){
      switch(data[i].lane) {
        case "TOP":
        data[i].laneIndex = 0;
        break;
        case "JUNGLE":
        data[i].laneIndex = 1;
        break;
        case "MIDDLE":
        data[i].laneIndex = 2;
        break;
        case "BOTTOM":
        data[i].laneIndex = 3;
        break;
        default:
        data[i].laneIndex = 4;
      }

      switch(data[i].champType) {
        case "Assassin":
        data[i].typeIndex = 0;
        break;
        case "Fighter":
        data[i].typeIndex = 1;
        break;
        case "Mage":
        data[i].typeIndex = 2;
        break;
        case "Marksman":
        data[i].typeIndex = 3;
        break;
        case "Support":
        data[i].typeIndex = 4;
        break;
        default:
        data[i].typeIndex = 5;
      }

      lolObj.children[data[i].laneIndex].children[data[i].typeIndex].children.push({"name":data[i].champName, "children":[{"name":"Wins", "size":data[i].wins, "children":[]},{"name":"Losses", "size":data[i].losses, "children":[]}]});

    }
    return lolObj;
  };

  uv.buildDataObject = function(obj){
    console.log('in buildDataObject with:', obj);
    var data = angular.copy(obj);
    var lolObj = { //format will be role->champType->champ->win/loss
      "name" : "Roles",
      "children":[
        {"name": "Top", "children":[]},
        {"name": "Jungle", "children":[]},
        {"name": "Mid", "children":[]},
        {"name": "Bot", "children":[]},
        {"name": "Unknown", "children":[]},
      ]
    };
    for(var o = 0; o < lolObj.children.length; o++){
      for(var n = 0; n < uv.typeList.length; n++){
        lolObj.children[o].children.push({"name":uv.typeList[n], "children":[]});
      }
    }


    console.log('data:', data);
    console.log('lolObj', lolObj);
    data = compressRelData(data);
    console.log('data after compress:', data);
    var finalData = buildDataTree(data, lolObj);
    console.log('finalData:', finalData);

displaySunBurst(finalData);


  };

  getParticipantIndex = function(id, match){ // returns participant index from match data
    var index = -1;
    for(var i = 0;i < match.participantIdentities.length; i++){
      // console.log('accountId is:',match.participantIdentities[i].player.accountId);
      if(match.participantIdentities[i].player.accountId == id){
        player = match.participantIdentities[i].participantId;
      }
    }
    // console.log('player:', player);
    for(var p = 0;p < match.participants.length; p++){
      if(match.participants[p].participantId == player){
        index = p;
      }
    }
    return index;
  };

  getLane = function(id, match){ // returns which lane was played in
    // console.log('in getLane with id:', id);
    // console.log('in getLane with index:', match);
    var player = -1;
    var lane = "none";
    var index = getParticipantIndex(id, match);
    lane = match.participants[index].timeline.lane;
    return lane;
  };

  getChampion= function(id, match){ // returns champion id, name, and type for match
    // console.log('in getChampion with id:', id);
    // console.log('in getChampion with index:', match);
    var index = getParticipantIndex(id, match);
    var champID = match.participants[index].championId;
    var champName = "none";
    var champType = "none";
    for(var cName in uv.champData.data){
      if(uv.champData.data[cName].id == champID){
        champName = uv.champData.data[cName].name;
        champType = uv.champData.data[cName].tags[0];
      }
    }
    // console.log('champName is:', champName);
    // console.log('champID is:', champID);
    var champ = {champID:champID, champName:champName, champType:champType};
    return champ;
  };

  getWinLoss = function(id, match){ // returns true or false depending on if participant won or lost
    // console.log('in getWinLoss with id:', id);
    // console.log('in getWinLoss with index:', match);
    var index = getParticipantIndex(id, match);
    var win = match.participants[index].stats.win;
    return win;
  };

  uv.extractPlayerData = function(arr){ // builds relevant data for each match
    console.log('in extractPlayerData with:', arr);
    var relevantData=[];
    for(var i = 0; i < arr.length; i++){
      //winOrLoss,champ,lane
      var champ = getChampion(uv.accountID, arr[i]);
      relevantData[i] = {};
      relevantData[i].champName = champ.champName;
      relevantData[i].champID = champ.champID;
      relevantData[i].champType = champ.champType;
      relevantData[i].lane = getLane(uv.accountID, arr[i]);
      relevantData[i].win = getWinLoss(uv.accountID, arr[i]);

    }

    // displaySunBurst(*DATAOBJECT*);
    console.log('relevantData is:', relevantData);
    uv.relData = relevantData;
  };

  uv.buildChampionList = function(){
    for(var name in uv.champData.data){
      uv.champList.push(name);
    }
    console.log('uv.champList is:', uv.champList);
  };

  displaySunBurst = function(dataObject){
    console.log('in displaySunBurst');
    uv.loading = false;


    var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

    var formatNumber = d3.format(",d");

    var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

    var y = d3.scaleSqrt()
    .range([0, radius]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var partition = d3.partition();

    var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");



    root = d3.hierarchy(dataObject);
    root.sum(function(d) { return d.size; });
    svg.selectAll("path")
    .data(partition(root).descendants())
    .enter().append("path")
    .attr("d", arc)
    // .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })

    .style("fill", function(d) {
      if(d.data.name == "Losses"){
        return "red";
      } else if(d.data.name == "Wins"){
        return "green";
      }
      return color(d.data.name); })
    .on("click", click)
    .append("title")
    .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });



    function click(d) {
      svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
        yd = d3.interpolate(y.domain(), [d.y0, 1]),
        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
      .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
    }

    d3.select(self.frameElement).style("height", height + "px");

  };
  return uv;

});
