const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// load User Model
require("../models/Article");
const Article = mongoose.model("article");

// index route
router.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        articles: articles
      });
    }
  }).sort({ _id: -1 });
});

// GET | register form
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard");
});

// Access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/user/login");
  }
}

module.exports = router;
