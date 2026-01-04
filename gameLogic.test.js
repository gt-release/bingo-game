const assert = require('assert');
const { describe, it } = require('node:test');
const {
  ranges,
  COLUMN_KEYS,
  generateBoard,
  toggleMark,
  markNumber,
  checkWin,
} = require('./gameLogic');

function isNumberInRange(number, [start, end]) {
  return number >= start && number <= end;
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

describe('generateBoard', () => {
  it('creates a 5x5 grid with a marked FREE center', () => {
    const board = generateBoard();

    assert.strictEqual(board.length, 5);
    board.forEach((row) => assert.strictEqual(row.length, 5));
    assert.strictEqual(board[2][2].label, 'FREE');
    assert.strictEqual(board[2][2].marked, true);
  });

  it('fills each column with numbers in the correct range without duplicates', () => {
    const board = generateBoard();

    COLUMN_KEYS.forEach((key, colIndex) => {
      const seen = new Set();
      board.forEach((row, rowIndex) => {
        const { label } = row[colIndex];
        if (label === 'FREE') return;
        assert.ok(isNumberInRange(label, ranges[key]));
        assert.ok(!seen.has(label));
        seen.add(label);
      });
      const expectedCount = colIndex === 2 ? 4 : 5;
      assert.strictEqual(seen.size, expectedCount);
    });
  });
});

describe('marking and toggling cells', () => {
  it('marks matching numbers when called', () => {
    const board = generateBoard();
    const target = board[0][0].label;

    assert.strictEqual(board[0][0].marked, false);
    markNumber(board, target);
    assert.strictEqual(board[0][0].marked, true);
  });

  it('toggles non-free cells but ignores FREE', () => {
    const board = generateBoard();
    const nextBoard = toggleMark(cloneBoard(board), 0, 1);

    assert.strictEqual(nextBoard[0][1].marked, true);
    const reverted = toggleMark(cloneBoard(nextBoard), 0, 1);
    assert.strictEqual(reverted[0][1].marked, false);

    const freeToggled = toggleMark(cloneBoard(board), 2, 2);
    assert.strictEqual(freeToggled[2][2].marked, true);
  });
});

describe('checkWin', () => {
  it('detects complete rows, columns, and diagonals', () => {
    const baseBoard = generateBoard();

    const rowWin = cloneBoard(baseBoard);
    rowWin[1] = rowWin[1].map((cell) => ({ ...cell, marked: true }));
    assert.strictEqual(checkWin(rowWin), true);

    const colWin = cloneBoard(baseBoard);
    for (let i = 0; i < 5; i += 1) {
      colWin[i][3] = { ...colWin[i][3], marked: true };
    }
    assert.strictEqual(checkWin(colWin), true);

    const diagWin = cloneBoard(baseBoard);
    for (let i = 0; i < 5; i += 1) {
      diagWin[i][i] = { ...diagWin[i][i], marked: true };
    }
    assert.strictEqual(checkWin(diagWin), true);
  });

  it('returns false when no winning lines are marked', () => {
    const board = generateBoard();
    assert.strictEqual(checkWin(board), false);
  });
});
