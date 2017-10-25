var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var API_KEY = process.env.API_KEY || require('../config.js').apiKey;

// var fs = require('fs');
// var allMatchData = [];

// Route includes

var port = process.env.PORT || 5001;

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve back static files
app.use(express.static('./server/public'));

// https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/RiotSchmick?api_key=<key>
// /lol/summoner/v3/summoners/by-name/{summonerName}
// /lol/match/v3/matches/{matchId} Get match by match ID.
// /lol/match/v3/matchlists/by-account/{accountId} Get matchlist for games played on given account ID and platform ID and filtered using given filter parameters, if any.
// /lol/match/v3/matchlists/by-account/{accountId}/recent Get matchlist for last 20 matches played on given account ID and platform ID.
// /lol/match/v3/timelines/by-match/{matchId}
app.get('/getSummonerID/:name', function(req, res){
  var sumName = req.params.name;
  var URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + sumName + '?api_key=' + API_KEY;
  request(URL, function(err, response, body) {
    if(err) {
      console.log('error:', err);
      res.sendStatus(500);
    } else {
      res.send(body);
    }
  });
});

app.get('/getMatches/:id', function(req, res){
  var sumID = req.params.id;
  var URL = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/' + sumID + '/recent?api_key=' + API_KEY;
  request(URL, function(err, response, body) {
    if(err) {
      console.log('error:', err);
      res.sendStatus(500);
    } else {
      res.send(body);
    }
  });
});

app.get('/getMatchData/:id', function(req, res){
  var matchID = req.params.id;
  var URL = 'https://na1.api.riotgames.com/lol/match/v3/matches/' + matchID + '?api_key=' + API_KEY;
  request(URL, function(err, response, body) {
    if(err) {
      console.log('error:', err);
      res.sendStatus(500);
    } else {
      // allMatchData.push(JSON.parse(body));
      res.send(body);
    }
  });
});

// app.get('/writeData', function(req, res){
//   var dataObj = {data: allMatchData};
//   var content = JSON.stringify(dataObj);
//
//   fs.writeFile("testData.json", content, 'utf8', function (err) {
//       if (err) {
//           return console.log(err);
//       }
//
//       console.log("The file was saved!");
//       res.sendStatus(200);
//   });
//
//
//
// });


app.get('/', function(req, res) {
  console.log('request for index');
  res.sendFile(path.join(__dirname, './public/views/index.html'));
});

app.get('/*', function(req, res) {
  console.log('404 : ', req.params);
  res.sendStatus(404);
});

// Listen //
app.listen(port, function(){
  console.log('Listening on port:', port);
});
