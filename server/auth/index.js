const express = require('express');
const Joi = require('@hapi/joi'); // validates input
const bcrypt = require('bcryptjs');

const db = require('../db/connection');
const users = db.get('users');
users.createIndex('username', { unique: true });

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(6).max(30).required(),
  password: Joi.string().trim().min(8).required()
  //email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['edu'] }}).required()
});

// any route in here is pre-pended with /auth

router.get('/', (req, res) => {
  res.json({
    message: '🔐'
  });
});

// POST /auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { username, password } =  req.body;
    const result = await schema.validateAsync(req.body);
    
    users.findOne({
      username: req.body.username
      //email: req.body.email
    }).then(user => {
      // if user is undefined, username is not in db, otherwise, it's a duplicate user
      if(user) {
        // already a user in db with this username
        const error = new Error('That username or email is already taken. Please choose a different one.');
        next(error);
      } else {
        // hash password
        bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {
          // insert user with hashed password
          const newUser = {
            username: req.body.username,
            password: hashedPassword
          };
          users.insert(newUser).then(insertedUser => {
            // don't send back hashed password
            delete insertedUser.password;
            res.json(insertedUser);
          });
        });
      }
    });
  }
  catch (err) {
    next(err);
  }


});

module.exports = router;