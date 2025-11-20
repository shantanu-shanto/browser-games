// board.js
export const boardSize = 15;
export const gameBoard = document.getElementById('game-board');

export function createBoard() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');

      // Define player zones with transparency
      if (row < 6 && col < 6) cell.classList.add('red-zone');
      else if (row > 8 && col < 6) cell.classList.add('green-zone');
      else if (row > 8 && col > 8) cell.classList.add('yellow-zone');
      else if (row < 6 && col > 8) cell.classList.add('blue-zone');

      // Center home block 3x3 middle
      if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
        cell.classList.add('home-center');
      }

      gameBoard.appendChild(cell);
    }
  }
}
