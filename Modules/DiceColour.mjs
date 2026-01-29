export const diceColourChange = function (req, res, next){
  if(!req.session?.dice){
    return res.status(401).json("No Dice!");
  }
  if (req.body.dice && Array.isArray(req.body.dice)) {
    const color = req.body.diceColor || req.user?.diceColor || '#FF5733';
    
    req.body.dice = req.body.dice.map(die => ({
      ...die,
      color: color
    }));
  }
  next();
};