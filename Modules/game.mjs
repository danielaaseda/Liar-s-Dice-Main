let game = null;

function rollDice(amount = 5) {
  const dice = [];
  for (let i = 0; i < amount; i++) {
    dice.push(Math.floor(Math.random() * 6) + 1);
  }
  return dice;
}

function countDice(value) {
  let total = 0;

  for (const player of game.players) {
    for (const die of player.dice) {
      if (die === value) total++;
    }
  }

  return total;
}

export function startGame(playerId) {

  game = {
    players: [
      { id: playerId, dice: rollDice() },
      { id: "computer", dice: rollDice() }
    ],
    currentBid: null,
    turn: playerId
  };

  return {
    dice: game.players[0].dice
  };
}

export function placeBid(playerId, quantity, value) {

  if (game.turn !== playerId)
    throw new Error("NOT_YOUR_TURN");

  const newBid = { quantity, value };

  if (game.currentBid) {

    const prev = game.currentBid;

    const valid =
      quantity > prev.quantity ||
      (quantity === prev.quantity && value > prev.value);

    if (!valid)
      throw new Error("INVALID_BID");
  }

  game.currentBid = newBid;

  game.turn = "computer";

  return computerTurn();
}

function computerTurn() {

  if (Math.random() < 0.3) {
    return callLiar("computer");
  }

  const bid = {
    quantity: game.currentBid.quantity + 1,
    value: game.currentBid.value
  };

  game.currentBid = bid;

  game.turn = game.players[0].id;

  return {
    action: "bid",
    bid
  };
}

export function callLiar(caller) {

  const { quantity, value } = game.currentBid;

  const actual = countDice(value);

  const liar = actual < quantity;

  return {
    action: "liar",
    caller,
    bid: game.currentBid,
    actual
  };
}

export function getGame() {
  return game;
}