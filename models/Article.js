let mongoose = require("mongoose");

// Article Schema
let articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

let Article = (module.exports = mongoose.model("article", articleSchema));
