const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");

// Article Model
let Article = require('../models/Article');
// User Model
let User = require('../models/User');

// GET | Add article route
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("addArticle");
});

// GET | single article route
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render("singleArticle", {
        article: article,
        author: user.name
      });
    });
  });
});

// POST | Add article process
router.post("/add", ensureAuthenticated, (req, res) => {
  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("body", "Body is required").notEmpty();

  //   get errors
  const errors = req.validationErrors();

  if (errors) {
    res.render("addArticle", {
      errors: errors
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
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('editArticle', {
      article:article
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

// DELETE | delete idea process
// router.delete("/:id", ensureAuthenticated, (req, res) => {
//   const query = { _id: req.params.id };

//   Article.remove(query, err => {
//     if (err) {
//       console.log(err);
//       return;
//     } else {
//       // flash message
//       req.flash("warning", "Article has been deleted");
//       res.redirect("/");
//     }
//   });
// });

// Delete Article
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.remove(query, function(err){
        if(err){
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
