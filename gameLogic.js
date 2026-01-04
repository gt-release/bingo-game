const ranges = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

const COLUMN_KEYS = Object.keys(ranges);

function shuffle(arr) {
  const cloned = [...arr];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function generateColumn([start, end], count) {
  const numbers = Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  return shuffle(numbers).slice(0, count);
}

function generateBoard() {
  const newBoard = [];
  COLUMN_KEYS.forEach((key, colIndex) => {
    const columnNumbers = generateColumn(ranges[key], 5);
    columnNumbers.forEach((num, rowIndex) => {
      if (!newBoard[rowIndex]) newBoard[rowIndex] = [];
      newBoard[rowIndex][colIndex] = {
        label: rowIndex === 2 && colIndex === 2 ? "FREE" : num,
        marked: rowIndex === 2 && colIndex === 2,
      };
    });
  });
  return newBoard;
}

function toggleMark(board, row, col) {
  const cell = board[row][col];
  if (cell.label === "FREE") return board;
  board[row][col] = { ...cell, marked: !cell.marked };
  return board;
}

function markNumber(board, number) {
  COLUMN_KEYS.forEach((key, colIndex) => {
    const [start, end] = ranges[key];
    if (number < start || number > end) return;

    board.forEach((row, rowIndex) => {
      const cell = row[colIndex];
      if (cell.label === number) {
        board[rowIndex][colIndex] = { ...cell, marked: true };
      }
    });
  });
  return board;
}

function checkWin(board) {
  const size = 5;
  const isLineMarked = (cells) => cells.every((cell) => cell.marked);

  for (let i = 0; i < size; i += 1) {
    if (isLineMarked(board[i]) || isLineMarked(board.map((row) => row[i]))) {
      return true;
    }
  }

  const diag1 = board.map((row, i) => row[i]);
  const diag2 = board.map((row, i) => row[size - 1 - i]);
  if (isLineMarked(diag1) || isLineMarked(diag2)) {
    return true;
  }

  return false;
}

const BingoLogic = {
  ranges,
  COLUMN_KEYS,
  shuffle,
  generateColumn,
  generateBoard,
  toggleMark,
  markNumber,
  checkWin,
};

if (typeof module !== "undefined") {
  module.exports = BingoLogic;
}

if (typeof window !== "undefined") {
  window.BingoLogic = BingoLogic;
}
