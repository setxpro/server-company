require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./Models/Person");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());

// Create User
app.post("/auth/register", async (req, res) => {
  const { name, email, avatar, role, password } = req.body;

  if (!name) {
    return res.status(422).json({ message: "Nome é obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ message: "E-mail é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }

  // Check if exists

  const userExists = await Person.findOne({ email: email, password: password });

  if (userExists) {
    return res
      .status(422)
      .json({ message: "Por favor, utilize outro e-mail." });
  }

  // Create Pass

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create Perso
  const person = new Person({
    name,
    email,
    avatar,
    role,
    password: passwordHash,
  });

  try {
    await Person.create(person);
    res.status(200).json({ message: "Usuário Cadastrado com Sucesso!" });
  } catch (error) {
    console.log(error);
  }
});

// Sign in

app.post("/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ message: "E-mail é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }

  // Check if user exists
  const user = await Person.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }
  // Check if password matche
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(404).json({ message: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET_HASH;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res
      .status(200)
      .json({ message: "Autenticação realizada com sucesso!", token, user });
  } catch (error) {
    console.log(error);
  }
});

mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log("Connected to Mongoose");
    app.listen(process.env.PORT, () =>
      console.log("Server running on port " + process.env.PORT)
    );
  })
  .catch((err) => console.error(err));
