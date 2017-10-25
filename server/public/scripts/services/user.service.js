myApp.factory('UserService', function($http, $location){
  console.log('UserService Loaded');

  var uv = {};

  uv.lolObj = { //format will be role->champType->champ->win/loss
  "name" : "Roles",
  "children":[
    {"name": "Top", "children":[]},
    {"name": "Jungle", "children":[]},
    {"name": "Mid", "children":[]},
    {"name": "ADC", "children":[]},
    {"name": "Support", "children":[]},

  ]
};

  getParticipantIndex = function(id, match){ // returns particpant index from match data
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

  getChampion= function(id, match){
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

  uv.extractPlayerData = function(arr){ // gets relevant data
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
      relevantData[i].win=0;

    }

    // displaySunBurst();
    console.log('relevantData is:', relevantData);
  };

  displaySunBurst = function(){
    console.log('in displaySunBurst');


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



    root = d3.hierarchy(uv.lolObj);
    root.sum(function(d) { return d.size; });
    svg.selectAll("path")
        .data(partition(root).descendants())
      .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
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
