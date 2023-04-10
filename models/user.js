"use strict";

const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const bcrypt = require("bcrypt");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await User.hashPassword(password);
    const result = await db.query(
      // TODO: add current timestamp to paramertization?
      `INSERT INTO users (
          username,
          password,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0]
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username, password
        FROM users
        WHERE username=$1`,
      [username]
    );
    const user = result.rows[0];

    return user && (await bcrypt.compare(password, user.password) === true)
    // if (user) {
    //   if (await bcrypt.compare(password, user.password) === true) {
    //     return true;
    //   }
    // }
    // return false;
  }

  /** Update last_login_at for user
   * Returning { username, last_login_at }
   */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username, last_login_at`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
      FROM users
      ORDER BY last_login_at DESC`
    );

    const users = result.rows;

    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
        FROM users
        WHERE username = $1`,
      [username]);

      const user = result.rows[0];

      if (!user) throw new NotFoundError(`No such user: ${username}`);

      return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const mResult = await db.query(
      `SELECT id, to_username, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1
      ORDER BY sent_at`,
      [username]);

    const userMessages = mResult.rows;

    if (userMessages.length === 0) throw new NotFoundError(`${username} has no messages`);

    const tResult = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users
      JOIN messages
      ON message.to_username = users.username
      WHERE from_username = $1
      ORDER BY sent_at`,
      [username]);

      const recieptOfMessage = tResult.rows;

      userMessages.to_user = recieptOfMessage.map(r => r);

      return userMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }

  static async hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    return hashedPassword;
  }
}


module.exports = User;
