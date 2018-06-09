//import { fail } from "assert";


var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs  = require('express-handlebars');
var request = require("request");
//var mongojs = require("mongojs");
//var Note = require("./models/notes.js");
//var Article = require("./models/articles.js");
//express var app
var PORT = process.env.PORT || 3000;
var db = require("./models");

var app = express();
// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(express.static("public")); 
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



mongoose.connect("mongodb://localhost/adafruitdb");


//Scraping Adafruit

app.get('/', function (req, res) {

   db.Article.find({"saved": false}, function(error, data) {
        var hbsObject = {
          article: data
        };
        console.log("handleBars OBJECT: " + hbsObject);
        res.render("home", hbsObject);
      });
    });
    //saved article page
    app.get('/savedArticles', function (req, res) {
      
      db.Article.find({"saved": true}, function(error, data) {
           var hbsObject = {
             article: data
           };
           console.log(hbsObject);
           res.render("savedArticles", hbsObject);
         });
       });
//});
app.get("/scrape", function(req,res){
    
   request("https://learn.adafruit.com/category/adafruit-io", function(error, response, html) {
       
    var $ = cheerio.load(html);
    
    var titleCheck;
    $(".masonry-block").each(function(i, element) {
    
    
    var results = {};
    results.title = $(this).find('.title').find("a").html().split(/\n/g)[1].split(/<br>/g)[0];
    results.url = "https://learn.adafruit.com" + $(this).find('.title').find("h5").html().split(/href="/g)[1].split(/">/g)[0];
    results.author = $(this).find(".author").find("a").html().split(/name">/g)[1].split(/<\/span>/g)[0];
    results.description = $(this).find(".description").html().split(/">\n/g)[1].split(/\n</g)[0];
    results.imgVideo = $(this).find("video, img");
    // console.log("results "+[i]+" title: " + results.title);
    // console.log("results "+[i]+" url: " + results.url);
    // console.log("results "+[i]+" author: " + results.author);
    // console.log("results "+[i]+" description: " + results.description);
    // console.log("results "+[i]+" imgVideo: " + results.imgVideo);
    db.Article.findOne({title: results.title},(error,found)=>{
      if(error){
        console.log("titleCheck: " + error);
      }
      else if (found){
         
        return;
        
      }
      else{
        db.Article.create(results).then(function(dbArticle){
            console.log("create: " + dbArticle);
            res.send("Scrape Completed!!!");
        }).catch(function(err){
            console.log("scrape catch");
          return res.json(err);
        });
      } 
        });
      });
    });
    });

// save article
app.post("/saved/:id", function(req,res){
  db.Article.findOneAndUpdate({_id: req.params.id}, {"saved":true})
  .then((data)=>{
    res.json(data);
    })
    .catch((err)=>{
  res.json(err);
    })
  
});
//unsave article
app.post("/unsaved/:id", function(req,res){
  db.Article.findOneAndUpdate({_id: req.params.id}, {"saved":false})
    .then((data)=>{
        res.json(data);
    }).catch((err)=>{
      res.json(err);
    })
  
});

  
  
  app.post("/notes/:id", function(req, res) {
    console.log("req.body: " + req.body.title +" "+ req.body.body);
  // Create a new note and pass the req.body to the entry
    
    db.Note.create(req.body)
    .then(function(dbNote) {
      console.log("dbNote: " + dbNote);
      console.log("params id: " + req.params.id);
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    }).then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  
  
  });

  app.get("/savedNotes/:id",(req,res)=>{
    console.log("/savedNotes/ " + req.params.id);
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then((dbArticle)=>{
      res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
  })

});

app.delete("/delete/:note_id/:article_id", function(req, res) {
  // Use the note id to find and delete it
  db.Note.findOneAndRemove({ "_id": req.params.note_id }, function(err) {
    // Log any errors
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      db.Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {note: req.params.note_id}})
       // Execute the above query
        .exec(function(err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send("Note Deleted");
          }
        });
    }
  });
});

app.listen(PORT, function() {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
  });