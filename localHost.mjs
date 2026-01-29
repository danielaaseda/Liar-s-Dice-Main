import express from "express";
import { diceColourChange } from "./Modules/DiceColour.mjs"

//const express = req('express')
const app = express()
const port = 8080

//app.use(diceColourChange);

app.get('/', (req, res, next) => {
  res.send('Server Kjører!')
})
app.get("/dicecolour", diceColourChange, (req, res, next) =>{
  res.json ({message: "Colour Changed.", dice: req.dice});
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})