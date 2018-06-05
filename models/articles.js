//import { Schema } from "mongoose";//I did not write this line of code

var mongoose = require("mongoose");
var notes = require("./notes");
var Schema = mongoose.Schema;
var adafruitSchema = new Schema({
    
    title: {
           type: String,
           required:true
    },
    url: {
        type: String,
        required: true
    },
    imgVideo:{
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }, 
    description:{
        type: String,
        required: true
    },
    saved:{
        type: Boolean,
        default: false
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
      }
});
var Article = mongoose.model("Article", adafruitSchema);

module.exports = Article;