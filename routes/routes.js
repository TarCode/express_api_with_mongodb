var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var connectionString = process.env.DATABASE_URL || 'mongodb://localhost:27017/yourdbname'; //replace route with your db name and ensure mongodb server (mongod) is runnng
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session); //for logged in user session
var store = new MongoDBStore({
                               uri: connectionString,
                               collection: 'sessions'
                             });
router.use(session({ secret: 'keyboard cat', saveUninitialized: true, resave: true, cookie: { maxAge: 60000 }, store: store}));

// login route: creates session when user logs in
router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  MongoClient.connect(connectionString, function(err, db) {
    if (err) console.log(err);
    var collection = db.collection('users');
    collection.find({username: { $eq: username }, password: { $eq: password}}).toArray(function(err, items) {
      if (err) console.log(err);
      if(username == items[0].username && password == items[0].password) {
        session.user = username;
        res.status(200).send({user: session.user});
      } else {
        res.status().send('invalid username or password')
      }
      db.close();
    });
  });
});

// logout route: Destroys session when user logs out
router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if(err) console.error(err);
    res.status(200).send("logged out");
  });
});

//signup route: route for signing up users
router.post('/signup', function(req, res, next) {
  if(req.body.username && req.body.password) {
    var username = req.body.username;
    var password = req.body.password;
    var user = { username: username, password: password };
    MongoClient.connect(connectionString, function(err, db) {
      if (err) console.log(err);
      var collection = db.collection('users');
      collection.insert(user);
      res.status('OK').send('Registered');
      db.close();
    });
  } else {
    res.status().send('Username and password cannot be blank')
  }
});

//route for getting all events: still needs to be secured
router.get('/events', function(req, res, next) {
  MongoClient.connect(connectionString, function(err, db) {
    if(err) console.error(err);
    var collection = db.collection('events');
    collection.find({}).toArray(function(err, items) {
      if (err) console.error(err);
      res.status(200).send(items);
      db.close();
    });
  });
});

//route for posting to events: still needs to be secured
router.post('/events', function(req, res, next) {
  var event = req.body;
  MongoClient.connect(connectionString, function(err, db) {
    if (err) console.log(err);
    var collection = db.collection('events');
    if(event) {
      collection.insert(event);
      res.status(200).send('Event posted');
    } else {
      res.send(400).send('Error');
    }
    db.close();
  });
});

module.exports = router;
