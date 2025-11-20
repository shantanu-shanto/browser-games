// gameLogic.js

import { tokensPositions, updateTokenPositions } from './tokens.js';
import { path } from './path.js';

const players = ['red', 'green', 'yellow', 'blue'];
let currentPlayerIndex = 0;
let diceRoll = 0;

const rollBtn = document.getElementById('roll-dice');
const diceResult = document.getElementById('dice-result');
const turnInfo = document.getElementById('turn-info');

function updateTurnInfo() {
  turnInfo.textContent = `${players[currentPlayerIndex].toUpperCase()}'s turn`;
}

rollBtn.addEventListener('click', () => {
  diceRoll = Math.floor(Math.random() * 6) + 1;
  diceResult.textContent = diceRoll;
  updateTurnInfo();
  alert(`${players[currentPlayerIndex]} rolled a ${diceRoll}! Click on a token to move.`);
});

// Listen for custom event from tokens to move
document.getElementById('game-board').addEventListener('token-selected', e => {
  const { player, tokenIndex } = e.detail;
  moveToken(player, tokenIndex);
});

function moveToken(player, tokenIndex) {
  if (players[currentPlayerIndex] !== player) {
    alert("It's not your turn!");
    return;
  }

  let pos = tokensPositions[player][tokenIndex];

  if (pos === -1) {
    if (diceRoll === 6) {
      tokensPositions[player][tokenIndex] = 0; // Enter path start
      postMove();
    } else {
      alert('Need a 6 to move token out of base!');
    }
    return;
  }

  let newPos = pos + diceRoll;
  if (newPos >= path.length) {
    alert('Move exceeds path, cannot move!');
    return;
  }

  tokensPositions[player][tokenIndex] = newPos;
  postMove();
}

function postMove() {
  updateTokenPositions();
  diceRoll = 0;
  diceResult.textContent = '-';

  // If diceRoll was 6, player gets extra turn, else change player
  if (diceRoll !== 6) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }
  updateTurnInfo();
}

export { moveToken, currentPlayerIndex };
