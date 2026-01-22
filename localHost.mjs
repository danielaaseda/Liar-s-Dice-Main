import { diceColourChange } from "./Modules/DiceColour.mjs"
const express = req('express')
const app = express()
const port = 8080

app.use(diceColourChange);

app.get('/', (req, res, next) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})