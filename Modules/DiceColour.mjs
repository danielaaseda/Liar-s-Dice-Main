export function diceColour(req, res, next) {

  let colour = req.body?.diceColour;

  if (!colour) {
    colour = "gold";
  }

  const allowedColours = ["gold", "red", "blue", "green"];

  if (!allowedColours.includes(colour)) {
    return res.status(400).json({
      error: "INVALID_DICE_COLOUR"
    });
  }

  req.diceColour = colour;

  next();
}