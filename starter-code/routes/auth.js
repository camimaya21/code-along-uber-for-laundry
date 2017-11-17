// routes/auth-routes.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");

// User model
const User = require("../models/user");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    errorMessage: ''
  });
});

router.post('/login', (req, res, next) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput === '') {
    res.render('auth/login', {
      errorMessage: 'Enter both email and password to log in.'
    });
    return;
  }

  User.findOne({ email: emailInput }, (err, theUser) => {
    if (err || theUser === null) {
      res.render('auth/login', {
        errorMessage: `There isn't an account with email ${emailInput}.`
      });
      return;
    }

    if (!bcrypt.compareSync(passwordInput, theUser.password)) {
      res.render('auth/login', {
        errorMessage: 'Invalid password.'
      });
      return;
    }

    req.session.currentUser = theUser;
    res.redirect('/');
  });
});



router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const name = req.body.name;
  const email = req.body.username;
  const password = req.body.password;

  if (email === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ email }, "email", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });
  });
});

router.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("private", { user: req.user });
});

module.exports = router;
