(function () {
  const SIZE = 9;
  let currentPuzzle = [];

  function getBoardFromInputs() {
    const board = [];
    const boardDiv = document.getElementById('sudoku-board');
    const inputs = boardDiv.getElementsByTagName('input');

    for (let row = 0; row < SIZE; row++) {
      board[row] = [];
      for (let col = 0; col < SIZE; col++) {
        const idx = row * SIZE + col;
        const value = inputs[idx].value;
        board[row][col] = value ? parseInt(value, 10) : 0;
      }
    }

    return board;
  }

  function isBoardPositionConflict(board, row, col, value) {
    if (!value || value === 0) {
      return false;
    }

    for (let currentCol = 0; currentCol < SIZE; currentCol++) {
      if (currentCol !== col && board[row][currentCol] === value) {
        return true;
      }
    }

    for (let currentRow = 0; currentRow < SIZE; currentRow++) {
      if (currentRow !== row && board[currentRow][col] === value) {
        return true;
      }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const checkRow = startRow + r;
        const checkCol = startCol + c;
        if ((checkRow !== row || checkCol !== col) && board[checkRow][checkCol] === value) {
          return true;
        }
      }
    }

    return false;
  }

  function applyInputValidation(input) {
    if (input.disabled) {
      input.setAttribute('aria-invalid', 'false');
      input.classList.remove('conflict');
      return;
    }

    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const value = input.value ? Number(input.value) : 0;
    const board = getBoardFromInputs();
    const hasConflict = isBoardPositionConflict(board, row, col, value);

    input.classList.toggle('conflict', hasConflict);
    input.setAttribute('aria-invalid', String(hasConflict));
    input.title = hasConflict ? 'Invalid entry: conflicts with an existing value in the row, column, or box.' : '';
  }

  function createBoardElement() {
    const boardDiv = document.getElementById('sudoku-board');
    boardDiv.innerHTML = '';

    for (let row = 0; row < SIZE; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'sudoku-row';

      for (let col = 0; col < SIZE; col++) {
        const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.className = 'sudoku-cell';
        input.dataset.row = row;
        input.dataset.col = col;
        input.dataset.box = boxIndex;
        input.setAttribute('aria-invalid', 'false');
        input.addEventListener('input', (event) => {
          const value = event.target.value.replace(/[^1-9]/g, '');
          event.target.value = value;

          if (!value) {
            event.target.classList.remove('conflict');
            event.target.setAttribute('aria-invalid', 'false');
            event.target.title = '';
            return;
          }

          applyInputValidation(event.target);
        });
        rowDiv.appendChild(input);
      }

      boardDiv.appendChild(rowDiv);
    }
  }

  function renderPuzzle(puzzle) {
    currentPuzzle = puzzle;
    createBoardElement();

    const boardDiv = document.getElementById('sudoku-board');
    const inputs = boardDiv.getElementsByTagName('input');

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const idx = row * SIZE + col;
        const value = currentPuzzle[row][col];
        const input = inputs[idx];

        input.classList.remove('conflict', 'incorrect', 'hinted');
        input.setAttribute('aria-invalid', 'false');
        input.title = '';

        if (value !== 0) {
          input.value = value;
          input.disabled = true;
          input.readOnly = true;
          input.classList.add('prefilled');
        } else {
          input.value = '';
          input.disabled = false;
          input.readOnly = false;
        }
      }
    }
  }

  function getCurrentPuzzle() {
    return currentPuzzle;
  }

  window.SudokuBoard = {
    SIZE,
    getBoardFromInputs,
    isBoardPositionConflict,
    applyInputValidation,
    createBoardElement,
    renderPuzzle,
    getCurrentPuzzle,
  };
})();
