const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res
    .status(201)
    .json({ message: `User ${username} registered successfully` });
});

// Get the book list available in the shop
public_users.get("/books", function (req, res) {
  return res.json(books);
});

public_users.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/books");
    return res.json(response.data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "unable to process" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  const response = await axios.get(`http://localhost:5000/books`);
  let data = response.data;

  let exist = data[isbn];
  if (!exist) {
    return res.send(`unable to find book with ISBN: ${isbn}`);
  } else {
    return res.send(exist);
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  const response = await axios.get(`http://localhost:5000/books`);
  let data = response.data;
  let match = [];

  for (let isbn in data) {
    if (data[isbn].author === author) {
      match.push({ isbn, ...data[isbn] });
    }
  }

  if (match.length === 0) {
    return res
      .status(404)
      .json({ message: `No books found by author: ${author}` });
  }

  return res.json(match);
});

// Get all books based on isbn
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  const response = await axios.get(`http://localhost:5000/books`);
  let data = response.data;
  let match = [];
  for (let isbn in data) {
    if (data[isbn].title === title) {
      match.push({ isbn, ...data[isbn] });
    }
  }
  if (match.length === 0) {
    return res.status(404).json({ message: `unable to find title: ${title}` });
  }
  return res.json(match);
});

//  Get book review
public_users.get("/review/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  const response = await axios.get(`http://localhost:5000/books`);
  let data = response.data;

  return res.json(data[isbn].reviews);
});

module.exports.general = public_users;
