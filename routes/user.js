const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");

// load User Model
require("../models/User");
const User = mongoose.model("user");

// GET | register form
router.get("/register", (req, res) => {
  res.render("register");
});

// POST | Register a user
router.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // validator
  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();
  req
    .checkBody("password2", "Password did not match")
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors: errors
    });
  } else {
    const newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(err => {
          if (err) {
            console.log(err);
            return;
          } else {
            req.flash("success", "You have successfully registered");
            res.redirect("/user/login");
          }
        });
      });
    });
  }
});

// GET | login route
router.get("/login", (req, res) => {
  res.render("login");
});

// POST | login process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true
  })(req, res, next);
});

// GET | logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/user/login");
});

module.exports = router;
