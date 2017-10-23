var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

// Route includes

var eventRouter = require('./routes/event.router');

var port = process.env.PORT || 5001;

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve back static files
app.use(express.static('./server/public'));

// Routes
app.use('/event', eventRouter);

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
