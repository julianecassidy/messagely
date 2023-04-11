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
      `INSERT INTO users (
          username,
          password,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at)
        VALUES
          ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
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
      `SELECT id, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1
      ORDER BY sent_at`,
      [username]);

    const userMessages = mResult.rows;

    if (userMessages.length === 0) throw new NotFoundError(`${username} has no messages`);

    const tResult = await db.query(
      `SELECT id, 
              body, 
              sent_at, 
              read_at, 
              username, 
              first_name, last_name, phone
        FROM users AS u
          JOIN messages AS m
        ON m.to_username = u.username
        WHERE from_username = $1
        ORDER BY sent_at`,
      [username]);

      return tResult.rows.map(r => ({
        id: r.id,
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at,
        to_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        }
      }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const fResult = await db.query(
      `SELECT id, 
              body, 
              sent_at, 
              read_at, 
              username, 
              first_name, 
              last_name, 
              phone
        FROM users AS u
          JOIN messages AS m
        ON m.from_username = u.username
        WHERE to_username = $1
        ORDER BY sent_at`,
      [username]);

      return fResult.rows.map(r => ({
        id: r.id,
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at,
        from_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        }
      }));
  }

  static async hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    return hashedPassword;
  }
}


module.exports = User;
