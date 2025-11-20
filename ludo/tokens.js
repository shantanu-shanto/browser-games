// tokens.js

import { path, boardSize, gameBoard } from './board.js';

const players = ['red', 'green', 'yellow', 'blue'];
const tokensPerPlayer = 4;

export let tokensPositions = {
  red: new Array(tokensPerPlayer).fill(-1),    // -1 means in base
  green: new Array(tokensPerPlayer).fill(-1),
  yellow: new Array(tokensPerPlayer).fill(-1),
  blue: new Array(tokensPerPlayer).fill(-1)
};

export function createTokens() {
  players.forEach(player => {
    for (let i = 0; i < tokensPerPlayer; i++) {
      const token = document.createElement('div');
      token.className = `token ${player}`;
      token.dataset.player = player;
      token.dataset.index = i;

      const baseCell = getBaseCell(player, i);
      baseCell.appendChild(token);

      // Attach click listener for moving (to be handled in gameLogic)
      token.addEventListener('click', () => {
        const event = new CustomEvent('token-selected', {
          detail: { player, tokenIndex: i },
          bubbles: true
        });
        token.dispatchEvent(event);
      });
    }
  });
}

function getBaseCell(player, tokenIndex) {
  // Base coordinates for each player tokens (corners)

  const redBase = [[0,0],[0,1],[1,0],[1,1]];
  const greenBase = [[13,0],[14,0],[13,1],[14,1]];
  const yellowBase = [[13,13],[14,13],[13,14],[14,14]];
  const blueBase = [[0,13],[1,13],[0,14],[1,14]];

  let coords;
  switch(player) {
    case 'red': coords = redBase[tokenIndex]; break;
    case 'green': coords = greenBase[tokenIndex]; break;
    case 'yellow': coords = yellowBase[tokenIndex]; break;
    case 'blue': coords = blueBase[tokenIndex]; break;
  }
  return getCell(coords[0], coords[1]);
}

function getCell(row,col) {
  return gameBoard.children[row * boardSize + col];
}

export function updateTokenPositions() {
  // Remove all tokens
  document.querySelectorAll('.token').forEach(t => {
    if (t.parentElement) t.parentElement.removeChild(t);
  });

  // Place tokens based on tokensPositions on board
  players.forEach(player => {
    for (let i = 0; i < tokensPerPlayer; i++) {
      const pos = tokensPositions[player][i];
      let cell;
      if (pos === -1) {
        cell = getBaseCell(player, i);
      } else if (pos >= 0 && pos < path.length) {
        const [r, c] = path[pos];
        cell = getCell(r, c);
      } else {
        // If beyond path length, place token in last cell of path (for now)
        const [r, c] = path[path.length - 1];
        cell = getCell(r, c);
      }

      const tokenDiv = document.createElement('div');
      tokenDiv.className = `token ${player}`;
      tokenDiv.dataset.player = player;
      tokenDiv.dataset.index = i;
      cell.appendChild(tokenDiv);

      tokenDiv.addEventListener('click', () => {
        const event = new CustomEvent('token-selected', {
          detail: { player, tokenIndex: i },
          bubbles: true
        });
        tokenDiv.dispatchEvent(event);
      });
    }
  });
}
