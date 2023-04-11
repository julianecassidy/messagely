"use strict";

const Router = require("express").Router;
const router = new Router();
const { authenticate, updateLoginTimestamp, register } = require("../models/user");
const { BadRequestError, UnauthorizedError } = require('../expressError');
const { SECRET_KEY } = require('../config.js');
const jwt = require('jsonwebtoken');


/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  };
  const { username, password } = req.body;

  const isUser = await authenticate(username, password);

  if (isUser) {
    await updateLoginTimestamp(username);
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  } else {
    throw new UnauthorizedError('Invalid username/password');
  }
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  };
  const user = req.body;
  // console.log(user);

  let values = Object.values(user);
  if (values.length < 5) {
    throw new BadRequestError('All fields must be filled out.');
  }
  for (let val of values) {
    if (val === undefined || val === '') {
      throw new BadRequestError('All fields must be filled out.');
    }
  }

  let registerUser;
  try {
    registerUser = await register(user); //Maybe an issue
  } catch (error) {
    throw new BadRequestError('Username must be unique');
  }

  await updateLoginTimestamp(registerUser.username);
  const token = jwt.sign({ username: registerUser.username }, SECRET_KEY);
  return res.json({ token });
});

module.exports = router;