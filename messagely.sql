\echo 'Delete and recreate messagely db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely;
CREATE DATABASE messagely;
\connect messagely


CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

  INSERT INTO users (username, password, first_name, last_name, phone)
  VALUES ('vaughn', 'password', 'vaughn', 'seekamp', '925-457-2646'),
   ('juliane', 'password', 'juliane', 'cassidy', '915-457-2646'),
   ('joel', 'password', 'joel', 'burton', '825-457-2646'),
   ('elie', 'password', 'elie', 'sphok', '725-457-2646'),
   ('spencer', 'password', 'spencer', 'john', '325-457-2646');


INSERT INTO messages (from_username, to_username, body)
VALUES ('vaughn', 'juliane', 'Hi'),
 ('vaughn', 'juliane', 'current_timestamp'),
 ('juliane', 'vaughn', 'snowboarding'),
 ('juliane', 'joel', 'Python rules'),
 ('elie', 'joel', 'Nice code'),
 ('joel', 'vaughn', 'Youre fired'),
 ('spencer', 'joel', 'Insomnia check enclosed');

\echo 'Delete and recreate messagely_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely_test;
CREATE DATABASE messagely_test;
\connect messagely_test

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

