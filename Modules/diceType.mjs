export function diceType(req, res, next) {

  let diceType = req.body?.diceType;

  if (!diceType) {
    diceType = 6;
  }

  diceType = Number(diceType);

  if (![6, 20].includes(diceType)) {
    return res.status(400).json({
      error: "INVALID_DICE_TYPE"
    });
  }

  req.diceType = diceType;

  next();
}