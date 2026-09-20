const SIZE = window.SudokuBoard.SIZE;
const DIFFICULTY_LEVELS = {
  easy: 45,
  medium: 35,
  hard: 25,
};

let puzzle = [];
let currentGameHints = 0;
let currentGameCompleted = false;

function openNameDialog() {
  const dialog = document.getElementById('name-dialog');
  const input = document.getElementById('player-name');
  if (dialog) {
    dialog.classList.remove('hidden');
    input.value = '';
    input.focus();
  }
}

function closeNameDialog() {
  const dialog = document.getElementById('name-dialog');
  if (dialog) {
    dialog.classList.add('hidden');
  }
}

function submitLeaderboardEntry() {
  const playerName = document.getElementById('player-name').value.trim() || 'Player';
  const result = {
    name: playerName,
    playerName,
    time: window.SudokuTimer.getElapsedSeconds(),
    difficulty: document.getElementById('difficulty-select').value,
    hints: currentGameHints,
    hintsUsed: currentGameHints,
  };

  window.SudokuStorage.addLeaderboardEntry(result);
  closeNameDialog();
  document.getElementById('leaderboard-form').reset();
}

function handleCompletionSavedState() {
  if (currentGameCompleted) {
    return true;
  }
  currentGameCompleted = true;
  openNameDialog();
  return true;
}

function renderLeaderboard() {
  window.SudokuStorage.renderLeaderboard();
}

function updateTimerDisplay() {
  window.SudokuTimer.updateTimerDisplay();
}

function stopTimer() {
  window.SudokuTimer.stopTimer();
}

function startTimer() {
  window.SudokuTimer.startTimer();
}

async function applyHint() {
  if (currentGameCompleted) {
    return;
  }

  const res = await fetch('/hint');
  const data = await res.json();

  if (data.error || data.message) {
    const msg = document.getElementById('message');
    msg.dataset.state = 'error';
    msg.style.color = '';
    msg.innerText = data.message || data.error;
    return;
  }

  currentGameHints += 1;

  const row = Number(data.row);
  const col = Number(data.col);
  const value = Number(data.value);
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const input = inputs[row * SIZE + col];

  if (!input) {
    return;
  }

  input.value = value;
  input.disabled = true;
  input.readOnly = true;
  input.classList.remove('conflict', 'incorrect');
  input.classList.add('hinted');
  input.setAttribute('aria-invalid', 'false');
  input.title = 'Hint: this cell was filled for you.';

  puzzle[row][col] = value;
  document.getElementById('message').innerText = '';

  const boardAfterHint = window.SudokuBoard.getBoardFromInputs();
  const filledBoard = boardAfterHint.every(rowValues => rowValues.every(cell => cell !== 0));
  if (filledBoard) {
    const solved = await checkSolution();
    if (solved) {
      stopTimer();
    }
  }
}

async function newGame() {
  currentGameCompleted = false;
  currentGameHints = 0;

  const difficultySelect = document.getElementById('difficulty-select');
  const difficulty = difficultySelect.value;
  const clues = DIFFICULTY_LEVELS[difficulty];
  const res = await fetch(`/new?clues=${clues}`);
  const data = await res.json();

  window.SudokuBoard.renderPuzzle(data.puzzle);
  puzzle = window.SudokuBoard.getCurrentPuzzle();
  startTimer();
  document.getElementById('message').innerText = '';
}

async function checkSolution() {
  if (currentGameCompleted) {
    return true;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = window.SudokuBoard.getBoardFromInputs();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ board })
  });
  const data = await res.json();
  const msg = document.getElementById('message');

  if (data.error) {
    msg.dataset.state = 'error';
    msg.style.color = '';
    msg.innerText = data.error;
    return false;
  }

  const invalidList = Array.isArray(data.invalid) ? data.invalid : (Array.isArray(data.incorrect) ? data.incorrect : []);
  const invalid = new Set(invalidList.map(([row, col]) => row * SIZE + col));
  const completed = board.every(rowValues => rowValues.every(value => value !== 0));

  for (let idx = 0; idx < inputs.length; idx++) {
    const input = inputs[idx];
    if (input.disabled) {
      input.classList.remove('conflict', 'incorrect');
      input.setAttribute('aria-invalid', 'false');
      input.title = input.classList.contains('hinted') ? 'Hint: this cell was filled for you.' : '';
      continue;
    }

    input.classList.remove('conflict', 'incorrect');
    const isInvalid = invalid.has(idx);
    input.classList.toggle('incorrect', isInvalid);
    input.setAttribute('aria-invalid', String(isInvalid));
    input.title = isInvalid ? 'Incorrect or missing value: this entry does not match the solution.' : '';
  }

  if (invalid.size === 0 && completed) {
    stopTimer();
    msg.dataset.state = 'success';
    msg.style.color = '';
    msg.innerText = 'Congratulations! You solved it!';
    handleCompletionSavedState();
    return true;
  }

  if (invalid.size > 0) {
    msg.dataset.state = 'error';
    msg.style.color = '';
    msg.innerText = 'Some cells are incorrect.';
    return false;
  }

  msg.dataset.state = 'info';
  msg.style.color = '';
  msg.innerText = 'Keep going — empty cells can still be filled.';
  return false;
}

window.addEventListener('load', () => {
  window.SudokuTheme.initializeTheme();
  renderLeaderboard();

  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint-button').addEventListener('click', applyHint);
  document.getElementById('difficulty-select').addEventListener('change', newGame);
  document.getElementById('check-solution').addEventListener('click', async () => {
    await checkSolution();
  });
  document.getElementById('theme-toggle').addEventListener('click', () => {
    window.SudokuTheme.toggleTheme();
  });
  document.getElementById('leaderboard-form').addEventListener('submit', (event) => {
    event.preventDefault();
    submitLeaderboardEntry();
  });
  document.getElementById('cancel-name').addEventListener('click', () => {
    closeNameDialog();
    document.getElementById('leaderboard-form').reset();
  });

  updateTimerDisplay();
  newGame();
});