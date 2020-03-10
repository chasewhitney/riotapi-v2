myApp.controller("UserController", function(
  UserService,
  $http,
  $location,
  $mdDialog
) {
  console.log("UserController created");
  var vm = this;
  vm.userService = UserService;
  vm.progressVal = 0;

  vm.doAll = function(name) {
    getPlayerAccount(name) // Get player account ID
      .then(getMatches) // Get match IDs for recently played games
      .then(extractMatchIDs) // Pull match IDs from game data and put into an array
      .then(getMatchData) // Get full match data for each match ID in array
      .then(getChampionNames) // Add played champion name to match data based on provided championId
      .then(buildObj) // Build sunburst object based on provided match data
      .then(displaySunBurst);
  };

  function treeObj(name) {
    this.name = name;
    this.children = [];
  }

  function endObj(name) {
    this.name = name;
    this.children = [
      { name: "Wins", size: 0, children: [] },
      { name: "Losses", size: 0, children: [] }
    ];
  }

  function buildObj(matchDataArray) {
    // Builds sunburst object from match data
    console.log("matchDataArray is:", matchDataArray);
    var finalObj = new treeObj("Lane");
    var fObj = finalObj.children;

    matchDataArray.forEach((v, i) => {
      if (v.gameMode == "CLASSIC") {
        var pMD = v.participants[getParticipantIndex(v)]; // Player's match data
        var lane = pMD.timeline.lane; // Lane player played inspect
        if (lane == "NONE") {
          lane = "UNKNOWN";
        }
        var champ = pMD.champion; // Champion played
        var win = pMD.stats.win; // Won or lost the match

        var laneIndex = findWithProp(fObj, "name", lane);
        if (laneIndex == -1) {
          fObj.push(new treeObj(lane));
          laneIndex = fObj.length - 1;
        }
        var champIndex = findWithProp(fObj[laneIndex].children, "name", champ);
        if (champIndex == -1) {
          fObj[laneIndex].children.push(new endObj(champ));
          champIndex = fObj[laneIndex].children.length - 1;
        }
        if (win) {
          fObj[laneIndex].children[champIndex].children[0].size++;
        } else {
          fObj[laneIndex].children[champIndex].children[1].size++;
        }
      }
    });
    console.log("finalObj is:", finalObj);
    return finalObj;
  }

  function getChampionNames(matchData) {
    console.log("getChampionNames:", matchData);
    return new Promise((resolve, reject) => {
      $http.get("/getChampList").then(response => {
        var champList = response.data;
        console.log("champList:", champList);
        matchData.forEach((v, i) => {
          var pMD = v.participants[getParticipantIndex(v)];
          pMD.champion = champList[pMD.championId];
        });
        resolve(matchData);
      });
    });
  }

  function getPlayerAccount(name) {
    // Gets player account information, including account ID
    console.log("in getPlayerAccount with name:", name);
    vm.progressVal += 2;
    //console.log(`In getPlayerAccount with: ${name}`);
    return $http.get("/getSummonerID/" + name);
  }

  function getMatches(result) {
    // Gets basic info from player's last 100 matches
    console.log("in getMatches with:", result);
    vm.progressVal += 3;
    vm.accountId = result.data.accountId;
    console.log(`attempting /getMatches/${vm.accountId}`);
    return $http.get("/getMatches/" + vm.accountId);
  }

  function extractMatchIDs(result) {
    // Gets match IDs from basic match info
    console.log("in extractMatchIDs with:", result);
    vm.progressVal += 5;
    var ids = result.data.matches;
    var matchIDs = [];
    try {
      if (ids == undefined) throw "API rate limit exceeded.";
      for (i = 0; i < ids.length; i++) {
        //// shortening matchIDs to avoid exceeding rate limits during development
        matchIDs.push(ids[i].gameId);
      }
      return matchIDs;
    } catch (err) {
      console.log("Error:", err);
      vm.progressVal = 0;
      alert(
        "Sorry, API rate limit exceeded. Please wait a minute before trying again."
      );
      return Promise.reject(err);
    }
  }

  function getMatchData(matchIDs) {
    // Gets full match data pertaining to each match ID
    console.log(`In getMatchData with:`, matchIDs);
    return new Promise((resolve, reject) => {
      var matchData = [];
      var rle = 0;
      for (var i = 0; i < matchIDs.length; i++) {
        $http.get("/getMatchData/" + matchIDs[i]).then(function(response) {
          if (response.data.gameId) {
            matchData.push(response.data);
          } else {
            rle++;
          }

          vm.progressVal += 0.9;
          if (matchData.length + rle == matchIDs.length) {
            vm.progressVal = 0;
            resolve(matchData);
          }
        });
      }
    });
  }

  function getParticipantIndex(item) {
    // Finds correct player in array of all players in match
    // console.log('in getParticipantIndex with:', item);
    for (var i = 0; i < item.participantIdentities.length; i++) {
      if (item.participantIdentities[i].player.accountId == vm.accountId) {
        return i;
      }
    }
  }

  function findWithProp(array, property, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][property] === value) {
        return i;
      }
    }
    return -1;
  }

  function displaySunBurst(dataObject) {
    console.log("in displaySunBurst with:", dataObject);
    var width = 960,
      height = 700,
      radius = Math.min(width, height) / 2 - 10;

    var formatNumber = d3.format(",d");

    var x = d3.scaleLinear().range([0, 2 * Math.PI]);

    var y = d3.scaleSqrt().range([0, radius]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var partition = d3.partition();

    var arc = d3
      .arc()
      .startAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
      })
      .endAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
      })
      .innerRadius(function(d) {
        return Math.max(0, y(d.y0));
      })
      .outerRadius(function(d) {
        return Math.max(0, y(d.y1));
      });

    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    root = d3.hierarchy(dataObject);
    root.sum(function(d) {
      return d.size;
    });
    svg
      .selectAll("path")
      .data(partition(root).descendants())
      .enter()
      .append("path")
      .attr("d", arc)

      .style("fill", function(d) {
        if (d.data.name == "Losses") {
          return "red";
        } else if (d.data.name == "Wins") {
          return "green";
        }
        return color(d.data.name);
      })
      .on("click", click)
      .append("title")
      .text(function(d) {
        return d.data.name + "\n" + formatNumber(d.value);
      });

    function click(d) {
      svg
        .transition()
        .duration(750)
        .tween("scale", function() {
          var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
          return function(t) {
            x.domain(xd(t));
            y.domain(yd(t)).range(yr(t));
          };
        })
        .selectAll("path")
        .attrTween("d", function(d) {
          return function() {
            return arc(d);
          };
        });
    }
    d3.select(self.frameElement).style("height", height + "px");
  }
});
