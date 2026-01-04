function bootstrap(logic) {
  const {
    ranges,
    COLUMN_KEYS,
    generateBoard,
    toggleMark: toggleMarkState,
    markNumber: markNumberState,
    checkWin: checkWinState,
  } = logic;

  const boardEl = document.getElementById("board");
  const winStatusEl = document.getElementById("win-status");
  const lastCalledEl = document.getElementById("last-called");
  const calledContainerEl = document.getElementById("called-container");
  const toastEl = document.getElementById("toast");

  const newGameBtn = document.getElementById("new-game");
  const drawNumberBtn = document.getElementById("draw-number");
  const autoPlayBtn = document.getElementById("auto-play");
  const resetCalledBtn = document.getElementById("reset-called");

  let board = [];
  let calledNumbers = new Set();
  let autoPlayInterval = null;

  function renderBoard() {
    boardEl.innerHTML = "";
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.textContent = cell.label;
        cellEl.setAttribute("role", "gridcell");
        cellEl.setAttribute("aria-label", `${COLUMN_KEYS[colIndex]}${cell.label}`);

        if (cell.marked) cellEl.classList.add("marked");
        if (cell.label === "FREE") cellEl.classList.add("free");

        cellEl.addEventListener("click", () => handleToggleMark(rowIndex, colIndex));
        boardEl.appendChild(cellEl);
      });
    });
  }

  function handleToggleMark(row, col) {
    const cell = board[row][col];
    if (cell.label === "FREE") return;
    board = toggleMarkState(board, row, col);
    renderBoard();
    updateWinStatus();
  }

  function drawNumber() {
    const allNumbers = Array.from({ length: 75 }, (_, idx) => idx + 1);
    const remaining = allNumbers.filter((n) => !calledNumbers.has(n));
    if (remaining.length === 0) return;

    const next = remaining[Math.floor(Math.random() * remaining.length)];
    calledNumbers.add(next);
    highlightCell(next);
    updateCalledList();
    lastCalledEl.textContent = next;
    lastCalledEl.classList.add("pop");
    setTimeout(() => lastCalledEl.classList.remove("pop"), 250);
    updateWinStatus();
  }

  function highlightCell(number) {
    board = markNumberState(board, number);
    renderBoard();
  }

  function updateCalledList() {
    calledContainerEl.innerHTML = "";
    const sorted = Array.from(calledNumbers).sort((a, b) => a - b);
    sorted.forEach((num) => {
      const item = document.createElement("div");
      item.className = "called-number";
      item.textContent = num;
      calledContainerEl.appendChild(item);
    });
  }

  function resetCalled() {
    calledNumbers = new Set();
    lastCalledEl.textContent = "--";
    calledContainerEl.innerHTML = "";
  }

  function updateWinStatus() {
    if (checkWinState(board)) {
      showWin();
      return true;
    }

    winStatusEl.textContent = "進行中";
    winStatusEl.classList.remove("win");
    return false;
  }

  function showWin() {
    winStatusEl.textContent = "BINGO!";
    winStatusEl.classList.add("win");
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function startAutoPlay() {
    if (autoPlayInterval) {
      stopAutoPlay();
      return;
    }
    autoPlayBtn.textContent = "停止";
    autoPlayInterval = setInterval(() => {
      drawNumber();
      const hasRemaining = calledNumbers.size < 75;
      if (!hasRemaining) stopAutoPlay();
    }, 1500);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    autoPlayBtn.textContent = "オート再生";
  }

  function init() {
    board = generateBoard();
    renderBoard();
    resetCalled();
    winStatusEl.textContent = "待機中";
    winStatusEl.classList.remove("win");
  }

  newGameBtn.addEventListener("click", () => {
    init();
    showToast("新しいカードを発行しました");
  });

  drawNumberBtn.addEventListener("click", () => {
    drawNumber();
  });

  autoPlayBtn.addEventListener("click", startAutoPlay);
  resetCalledBtn.addEventListener("click", () => {
    resetCalled();
    renderBoard();
  });

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  init();
}

function initializeApp() {
  if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      const logic = window?.BingoLogic;
      if (!logic) {
        console.error("BingoLogic が読み込まれていません。初期化を中断します。");
        return;
      }

      bootstrap(logic);
    });
    return;
  }

  if (typeof document === "undefined") {
    console.error("DOM のない環境ではアプリを初期化できません。");
    return;
  }

  const logic = require("./gameLogic");
  bootstrap(logic);
}

initializeApp();
