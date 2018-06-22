const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");

// Article Model
let Article = require("../models/Article");
// User Model
let User = require("../models/User");

// GET | Add article route
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("addArticle");
});

// GET | single article route
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render("singleArticle", {
        article,
        author: user.username
      });
    });
  });
});

// POST | Add article process
router.post("/add", ensureAuthenticated, (req, res) => {
  const { title, body } = req.body;

  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("body", "Body is required").notEmpty();

  //   get errors
  const errors = req.validationErrors();
  if (errors) {
    res.render("addArticle", {
      errors,
      title,
      body
    });
  } else {
    const article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(err => {
      if (err) {
        console.log(err);
        return;
      } else {
        // flash message
        req.flash("success", "Article Added");
        res.redirect("/");
      }
    });
  }
});

// GET | edit article route
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash("danger", "Not Authorized");
      return res.redirect("/");
    }
    res.render("editArticle", {
      article
    });
  });
});

// POST | edit article process
router.post("/edit/:id", ensureAuthenticated, (req, res) => {
  const article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  const query = { _id: req.params.id };

  Article.update(query, article, err => {
    if (err) {
      console.log(err);
      return;
    } else {
      // flash message
      req.flash("success", "Article has been updated");
      res.redirect("/");
    }
  });
});

// DELETE | Delete article
router.delete("/:id", (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }

  let query = { _id: req.params.id };

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, err => {
        if (err) {
          console.log(err);
        } else {
          // flash message
          req.flash("warning", "Article has been deleted");
          res.redirect("/");
        }
      });
    }
  });
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
