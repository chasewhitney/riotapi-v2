var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var request = require("request");
var Champ = require("./models/champ.js");
var Summoner = require("./models/summoner.js");
var API_KEY = process.env.API_KEY || require("./config.js").apiKey;
var db = require("./modules/db.config.js");
var port = process.env.PORT || 5001;
// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve back static files
app.use(express.static("./server/public"));

app.get("/getMatches/:id", function(req, res) {
  var sumID = req.params.id;
  var URL =
    "https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" +
    sumID +
    "?api_key=" +
    API_KEY;
  request(URL, function(err, response, body) {
    if (err) {
      console.log("error:", err);
      res.sendStatus(500);
    } else {
      res.send(body);
    }
  });
});

app.get("/getSummonerID/:name", function(req, res) {
  var sumName = req.params.name;
  var URL =
    "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
    sumName +
    "?api_key=" +
    API_KEY;
  request(URL, function(err, response, body) {
    if (err) {
      console.log("error:", err);
      res.sendStatus(500);
    } else {
      console.log("getSummonerId returning:", body);
      res.send(body);
    }
  });
});

app.get("/getMatchData/:id", function(req, res) {
  var matchID = req.params.id;
  var URL =
    "https://na1.api.riotgames.com/lol/match/v4/matches/" +
    matchID +
    "?api_key=" +
    API_KEY;
  request(URL, function(err, response, body) {
    if (err) {
      console.log("error:", err);
      res.sendStatus(500);
    } else {
      res.send(body);
    }
  });
});

app.get("/getChampList", function(req, res) {
  Champ.find({ name: "champ keys" }, function(err, data) {
    if (err) {
      console.log("find error:", err);
      res.sendStatus(500);
    } else {
      res.send(data[0].data);
    }
  });
});

app.get("/", function(req, res) {
  console.log("request for index");
  res.sendFile(path.join(__dirname, "./public/views/index.html"));
});

app.get("/*", function(req, res) {
  console.log("404 : ", req.params);
  res.sendStatus(404);
});

// Listen //
app.listen(port, function() {
  console.log("Listening on port:", port);
});

// app.post('/champData', (req,res) => {
//   var obj = {name: "champ keys", data: req.body};
//   console.log('in POST champData');
//   var Champy = new Champ(obj);
//
//   Champy.save(function(err, data) {
//           console.log('in save with:', data);
//           if(err) {
//             console.log('save error: ', err);
//             res.sendStatus(500);
//           } else {
//             console.log('Champ saved');
//             res.sendStatus(201);
//             }
//           });
// });
