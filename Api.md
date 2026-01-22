# Liar's Dice API Documentation

## Base URL
`http://localhost:8080/api`

## Overview
This API manages game sessions, dice rolls, bids, and challenges for the Liar's Dice game.

---

## Endpoints

### Create Game
**POST** `/games`

Creates a new game room.

**Request Body:**
```json
{
  "maxPlayers": 4,
  "dicePerPlayer": 5
}

Response: 201 Created
{
  "gameId": "abc123",
  "status": "waiting",
  "players": [],
  "createdAt": "2026-01-22T10:00:00Z"
}

Join Game
POST /games/:id/join

Request Body:
{
  "playerId": "player1",
  "diceColor": "#FF5733"
}

Response: 200 OK
{
  "gameId": "abc123",
  "players": ["player1"],
  "yourDice": [3, 4, 5, 2, 1],
  "diceColor": "#FF5733"
}

Error Responses:

404 - Game not found
400 - Game is full