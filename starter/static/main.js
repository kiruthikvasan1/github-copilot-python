// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_KEY = 'sudokuLeaderboard';
const THEME_KEY = 'sudokuTheme';
const DIFFICULTY_LEVELS = {
  easy: 45,
  medium: 35,
  hard: 25,
};
let puzzle = [];
let timerInterval = null;
let elapsedSeconds = 0;
let currentGameHints = 0;
let currentGameCompleted = false;

function getStoredTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
  } catch (error) {
    // Ignore storage issues; fall back to system preference.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.body.dataset.theme = nextTheme;

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const isDark = nextTheme === 'dark';
    toggle.textContent = isDark ? 'Light mode' : 'Dark mode';
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('aria-pressed', String(isDark));
  }
}

function initializeTheme() {
  applyTheme(getStoredTheme());
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  try {
    window.localStorage.setItem(THEME_KEY, nextTheme);
  } catch (error) {
    // Ignore theme storage errors so the game still works.
  }
  applyTheme(nextTheme);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function getStoredLeaderboard() {
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(entry => entry && typeof entry === 'object')
      .map(entry => ({
        playerName: typeof entry.playerName === 'string' ? entry.playerName.trim() || 'Player' : 'Player',
        time: Number(entry.time),
        difficulty: typeof entry.difficulty === 'string' ? entry.difficulty : 'medium',
        hintsUsed: Number(entry.hintsUsed)
      }))
      .filter(entry => Number.isFinite(entry.time) && Number.isFinite(entry.hintsUsed))
      .map(entry => ({
        playerName: entry.playerName.slice(0, 24),
        time: Math.max(0, Number(entry.time)),
        difficulty: entry.difficulty,
        hintsUsed: Math.max(0, Number(entry.hintsUsed))
      }));
  } catch (error) {
    return [];
  }
}

function saveLeaderboard(entries) {
  try {
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (error) {
    // Ignore storage errors so the game remains usable.
  }
}

function sortLeaderboard(entries) {
  return [...entries].sort((first, second) => {
    if (first.time !== second.time) {
      return first.time - second.time;
    }
    if (first.hintsUsed !== second.hintsUsed) {
      return first.hintsUsed - second.hintsUsed;
    }
    return first.playerName.localeCompare(second.playerName);
  });
}

function limitLeaderboard(entries) {
  return sortLeaderboard(entries).slice(0, 10);
}

function renderLeaderboard() {
  const table = document.getElementById('leaderboard-table');
  const emptyState = document.getElementById('leaderboard-empty');
  const body = document.getElementById('leaderboard-body');
  const entries = limitLeaderboard(getStoredLeaderboard());

  if (!entries.length) {
    table.style.display = 'none';
    emptyState.hidden = false;
    body.innerHTML = '';
    return;
  }

  table.style.display = 'table';
  emptyState.hidden = true;
  body.innerHTML = '';

  entries.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.playerName}</td>
      <td>${formatTime(entry.time)}</td>
      <td>${entry.difficulty}</td>
      <td>${entry.hintsUsed}</td>
    `;
    body.appendChild(row);
  });
}

function addLeaderboardEntry(entry) {
  const entries = limitLeaderboard([...getStoredLeaderboard(), entry]);
  saveLeaderboard(entries);
  renderLeaderboard();
}

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
    playerName,
    time: elapsedSeconds,
    difficulty: document.getElementById('difficulty-select').value,
    hintsUsed: currentGameHints,
  };

  addLeaderboardEntry(result);
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

function updateTimerDisplay() {
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    timerEl.textContent = `Time: ${formatTime(elapsedSeconds)}`;
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function getBoardFromInputs() {
  const board = [];
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');

  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
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
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.dataset.box = boxIndex;
      input.setAttribute('aria-invalid', 'false');
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        if (!val) {
          e.target.classList.remove('conflict');
          e.target.setAttribute('aria-invalid', 'false');
          e.target.title = '';
          return;
        }
        applyInputValidation(e.target);
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      inp.classList.remove('conflict', 'incorrect', 'hinted');
      inp.setAttribute('aria-invalid', 'false');
      inp.title = '';
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.readOnly = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.readOnly = false;
      }
    }
  }
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

  const boardAfterHint = getBoardFromInputs();
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
  renderPuzzle(data.puzzle);
  startTimer();
  document.getElementById('message').innerText = '';
}

async function checkSolution() {
  if (currentGameCompleted) {
    return true;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = getBoardFromInputs();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.dataset.state = 'error';
    msg.style.color = '';
    msg.innerText = data.error;
    return false;
  }

  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));
  const completed = board.every(row => row.every(value => value !== 0));

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      inp.setAttribute('aria-invalid', 'false');
      inp.title = inp.classList.contains('hinted') ? 'Hint: this cell was filled for you.' : '';
      continue;
    }

    inp.classList.remove('conflict', 'incorrect');
    const isIncorrect = incorrect.has(idx);
    inp.classList.toggle('incorrect', isIncorrect);
    inp.setAttribute('aria-invalid', String(isIncorrect));
    inp.title = isIncorrect ? 'Incorrect value: this entry does not match the solution.' : '';
  }

  if (incorrect.size === 0 && completed) {
    stopTimer();
    msg.dataset.state = 'success';
    msg.style.color = '';
    msg.innerText = 'Congratulations! You solved it!';
    handleCompletionSavedState();
    return true;
  } else if (incorrect.size > 0) {
    msg.dataset.state = 'error';
    msg.style.color = '';
    msg.innerText = 'Some cells are incorrect.';
    return false;
  } else {
    msg.dataset.state = 'info';
    msg.style.color = '';
    msg.innerText = 'Keep going — empty cells can still be filled.';
    return false;
  }
}

// Wire buttons
window.addEventListener('load', () => {
  initializeTheme();
  renderLeaderboard();
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint-button').addEventListener('click', applyHint);
  document.getElementById('difficulty-select').addEventListener('change', newGame);
  document.getElementById('check-solution').addEventListener('click', async () => {
    await checkSolution();
  });
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
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