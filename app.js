require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./Models/Person");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const routes = require("./routes");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
  res.header("Access-Control-Allow-Origin", "*");
  //Quais são os métodos que a conexão pode realizar na API
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  app.use(cors());
  next();
});

app.use(routes);

// Create User
app.post("/auth/register", async (req, res) => {
  const { name, email, avatar, role, assignment, password } = req.body;

  if (!name) {
    return res.status(422).json({ message: "Nome é obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ message: "E-mail é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }
  if (!role) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }
  if (!assignment) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }

  // Check if exists

  const userExists = await Person.findOne({
    email: email,
  });

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
    role,
    assignment,
    avatar,
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

// Find One User

app.get("/user/:id", async (req, res) => {
  const _id = req.params.id;

  const user = await Person.findById(_id, "-password");

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  res.status(200).json({ user });
});

// Find All Users
app.get("/users", async (req, res) => {
  const users = await Person.find();

  if (!users) {
    return res.status(404).json({ message: "Users not found." });
  }
  res.status(200).json({ users });
});

// Update User

app.patch("/user/:id", async (req, res) => {
  const _id = req.params.id;
  const { name, email, avatar, role, assignment, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = {
    name,
    email,
    avatar,
    role,
    assignment,
    password: passwordHash,
  };

  try {
    const userUpdate = await Person.updateOne({ _id }, user);
    if (userUpdate) {
      res.status(200).json({ message: "Usuário Atualizado com Sucesso!" });
      return;
    }
    if (userUpdate.matchedCount === 0) {
      res.status(422).json({ message: "Não foi possível alterar o usuário" });
      return;
    }
    res.status(200).json(userUpdate);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Delete User By ID

app.delete("/user/:id", async (req, res) => {
  const _id = req.params.id;
  const user = await Person.findOne({ _id });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  try {
    await Person.deleteOne({ _id });
    res.status(200).json({ message: "Usuário deletado com Sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log("Connected to Mongoose");
    app.listen(process.env.PORT || 3333, () =>
      console.log("Server running on port " + process.env.PORT)
    );
  })
  .catch((err) => console.error(err));
