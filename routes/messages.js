"use strict";

const { UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const { markRead, get, create } = require("../models/message");

const Router = require("express").Router;
const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function (req, res, next){

  let messages = await get(req.params.id);
  if (res.locals.user.username === messages.to_user.username ||
    res.locals.user.username === messages.from_user.username) {
      return res.json({ messages });
    } else {
      throw new UnauthorizedError();
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function (req, res, next) {
  let currUser = res.locals.user.username;
  let toUser = req.body.to_username;
  let messageBody = req.body.body;
  let newMessage = { from_username: currUser,
    to_username: toUser,
    body: messageBody
  }
  let createMessage = await create(newMessage);
  return res.json(createMessage);
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res, next){

  let messageId = await get(req.params.id);
  if (res.locals.user.username === messages.to_user.username) {
      let message = markRead(messageId.id)
      return res.json({ message });
    } else {
      throw new UnauthorizedError();
    }
});


module.exports = router;