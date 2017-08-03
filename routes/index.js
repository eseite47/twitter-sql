'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db');



module.exports = function makeRouterWithSockets(io) {

    // var insertTweet = function(res, idToInsert, username, content) {
    //   client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [idToInsert[0].id, content], function(err, data) {
    //     if (err) return next(err); // pass errors to Express
    //     var tweets = data.rows;
    //     res.render('index', {
    //       title: 'Twitter.js',
    //       tweets: tweets,
    //       showForm: true
    //     });
    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    // io.sockets.emit('new_tweet', newTweet);
    // res.redirect('/');
    //   });
    // }

    // a reusable function
    function respondWithAllTweets(req, res, next) {
      client.query('SELECT * FROM users join tweets on tweets.user_id = users.id', function(err, result) {
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets: tweets,
          showForm: true
        });
      });
    }

    router.get('/', respondWithAllTweets);
    router.get('/tweets', respondWithAllTweets);

    router.get('/users/:username', function(req, res, next) {
      var name = req.params.username;
      client.query('SELECT users.name, tweets.content FROM tweets join users on tweets.user_id = users.id WHERE name=$1', [
        name
      ], function(err, result) {
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets: tweets,
          showForm: true
        });
      });
    });

    // single-tweet page
    router.get('/tweets/:id', function(req, res, next) {
      // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
      // res.render('index', {
      //   title: 'Twitter.js',
      //   tweets: tweetsWithThatId // an array of only one element ;-)
      // });
      var id = req.params.id;
      client.query('SELECT users.name, tweets.content FROM tweets join users on tweets.user_id = users.id WHERE tweets.id=$1', [
        id
      ], function(err, result) {
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets: tweets,
          showForm: true
        });
      });
    })

    // create a new tweet
    router.post('/tweets', function(req, res, next) {
      var username = req.body.name;
      var content = req.body.content;
      client.query('SELECT id FROM users WHERE name=$1', [username], function(err, data) {
        var idToInsert = data.rows
        console.log(data.rows)
        // console.log('id', idToInsert)
        if (!idToInsert[0]) {
          // console.log("tester " + err)
          client.query('INSERT INTO users (name) VALUES ($1) RETURNING id', [username], function(err, data) {
            if (err) return next(err); // pass errors to Express
              var tweets = data.rows;
              console.log(data);
              // var newID = data.rows
              //insertTweet(res, idToInsert, username, content)
                client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [tweets[0].id, content], function(err, data) {
                  if (err) return next(err);
                  var tweets = data.rows;
                 res.render('index', {
                   title: 'Twitter.js',
                   tweets: tweets,
                   showForm: true
                })
              })
            })
          }


        else {
          client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [idToInsert[0].id, content], function(err, data) {
            if (err) return next(err); // pass errors to Express
              var tweets = data.rows;
                res.render('index', {
                title: 'Twitter.js',
                tweets: tweets,
                showForm: true
                });
              })
          }
        });
      });
    return router;
    }
