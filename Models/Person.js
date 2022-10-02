const mongoose = require("mongoose");

const Person = mongoose.model("Person", {
  name: String,
  email: String,
  password: String,
  role: String,
  assignment: String,
  avatar: String,
});

module.exports = Person;
