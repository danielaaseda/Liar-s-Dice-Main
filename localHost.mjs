import express from "express";
import { diceColourChange } from "./Modules/diceColour.mjs"
import authRoutes from "./Modules/accountManagement.mjs"
import session from "express-session";
import { confirmLogin } from "./Modules/confirm.mjs";

const app = express()
const port = 8080

app.use(
  session({
    secret: "dev-secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(express.json());

app.get('/', (req, res, next) => {
  res.send('Server Kjører!')
});
app.use("/acc", authRoutes);

app.use(express.static("Public"));

app.use("/Documentation", express.static("Documentation"));

app.get("/dicecolour", diceColourChange, (req, res, next) =>{
  res.json ({message: "Colour Changed.", dice: req.dice});
});
app.get("/session", confirmLogin, (req, res) => {
  res.json({message: "you are logged in!", user: req.user});
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});