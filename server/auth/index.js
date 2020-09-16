const express = require('express');
const Joi = require('joi'); // validates input
const bcrypt = require('bcryptjs');

const db = require('../db/connection');
const users = db.get('users');
users.createIndex('username', { unique: true });

const router = express.Router();

const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(6).max(30).required(),
  password: Joi.string().min(8).required()
});

// any route in here is pre-pended with /auth

router.get('/', (req, res) => {
  res.json({
    message: "🔐"
  });
});

// POST /auth/signup
router.post('/signup', (req, res) => {
  const result = Joi.ValidationError(req.body, schema);
  if(result.error === null) {
    // make sure username is unique
    users.findOne({
      username: req.body.username
    }).then(users => {
      // if user is undefined, username is not in db, otherwise, it's a duplicate user
      if(user) {
        // already a user in db with this username
        const error = new Error('That username is already taken. Please choose a different one.');
        next(error);
      } else {
        // hash password
        bcrypt.hash(req.body.password, 12).then(hashedPassword => {
          // insert user with hashed password
          const newUser = {
            username: res.body.username,
            password: hashedPassword
          };
          users.insert(newUser).then(insertedUser => {
            res.json(insertedUser);
          });
        });
      }
    });
  } else {
    next(result.error);
  }
});

module.exports = router;