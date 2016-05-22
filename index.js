var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var routes = require('./routes/routes');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if(req.method == 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}) ;
app.use('/', routes);
var port = process.env.PORT || 3001;
app.listen(port, function() {
  console.log('app listening on port ', port);
});

module.exports = app;
