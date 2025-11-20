// main.js
import { createBoard } from './board.js';
import { createTokens, updateTokenPositions } from './tokens.js';
import { moveToken } from './gameLogic.js';

window.onload = () => {
  createBoard();
  createTokens();
  updateTokenPositions(); // Place tokens in initial bases
  // Set initial turn info
  const turnInfo = document.getElementById('turn-info');
  turnInfo.textContent = "Red's turn";

  alert("Red's turn. Click 'Roll Dice' to start!");
};
