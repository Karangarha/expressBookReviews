const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  let user = users.find(
    (user) => user.username === username && user.password === password
  );
  return !!user;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization) {
    return res.status(401).json({ message: "user not logged in" });
  }

  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const {review} = req.body;

  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `No book found with isbn: ${isbn}` });
  }

  books[isbn].reviews[username] = review;

  return res
    .status(200)
    .json({ message: "Review added/updated successfully", book: books[isbn] });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization) {
    return res.status(401).json({ message: "user not logged in" });
  }

  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `No book found with isbn: ${isbn}` });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review deleted successfully for ISBN: ${isbn}`,
    book: books[isbn],
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
