/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freecodecamp");
        dbo.collection("books").find({}).toArray(function(err, result) {
          if (err) throw err;
          res.json(result);
        });
      });
    })
    
    .post(function (req, res){
      if (req.body.title) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw err;
          var dbo = db.db("freecodecamp");
          dbo.createCollection("books", function(err, res) {
              if (err) throw err;
              db.close();
            });
          var myobj = {title: req.body.title, 
                        commentcount: 0,
                        comments: []};
          dbo.collection("books").insertOne(myobj, function(err, result) {
              if (err) throw err;
              db.close();
              res.json(result.ops[0]);
            });
        });
      } else {
        res.json('title is required');
      }
    })
    
    .delete(function(req, res){
        var book = req.params._id;
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw err;
          var dbo = db.db("freecodecamp");
          var collection = dbo.collection("books")
          collection.deleteMany({}, function (err, results) {
                                  if (err) return res.json("failed to delete");
                                  db.close();
                                  res.json("complete delete successful");
          });
        });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freecodecamp");
        dbo.collection("books").find({_id: bookid}).toArray(function(err, result) {
          if (err) throw err;
          res.json(result.length == 0 ? "no book exists": result);
        });
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freecodecamp");
        dbo.collection("books").find({ _id: new ObjectId(bookid) }).toArray(function(err, result) {
          if (err) throw err;
          var newvalues = { $set: {comments: [...result[0].comments, comment], commentcount: result[0].commentcount + 1} };
          dbo.collection("books").findAndModify({ _id: new ObjectId(bookid) }, {}, newvalues, {new:true}, function (err, results) {
                                        if (err) return res.json("failed to post comment");
                                        db.close();
                                        res.json(results.value);
          });
         });
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
        if (req.body._id != null) {
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
            if (err) throw err;
            var dbo = db.db("freecodecamp");
            var collection = dbo.collection("books")
            collection.deleteOne({ _id: new MongoClient.ObjectId(bookid) }, function (err, results) {
                                    if (err) return res.json("failed to delete");
                                    db.close();
                                    res.json("delete successful");
            });
          });
        }
    });
  
};
