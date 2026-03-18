import express from "express";
import { startGame, placeBid, callLiar, getGame } from "../Modules/game.mjs";
import { confirmLogin } from "../Modules/confirm.mjs";

const router = express.Router();

router.post("/start", confirmLogin, (req, res) => {

  const result = startGame(req.session.user.id);

  res.json(result);

});

router.post("/bid", confirmLogin, (req, res) => {

  const { quantity, value } = req.body;

  try {

    const result = placeBid(
      req.session.user.id,
      Number(quantity),
      Number(value)
    );

    res.json(result);

  } catch (err) {

    res.status(400).json({ error: err.message });

  }

});

router.post("/liar", confirmLogin, (req, res) => {

  const result = callLiar(req.session.user.id);

  res.json(result);

});

router.get("/state", confirmLogin, (req, res) => {

  res.json(getGame());

});

export default router;