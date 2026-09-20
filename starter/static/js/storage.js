(function () {
  const LEADERBOARD_KEY = 'sudokuLeaderboard';

  function normalizeLeaderboardEntry(entry) {
    const rawName = typeof entry?.name === 'string'
      ? entry.name
      : (typeof entry?.playerName === 'string' ? entry.playerName : 'Player');
    const name = (rawName || 'Player').trim() || 'Player';
    const timeValue = Number(entry?.time);
    const hintsValue = Number(entry?.hints ?? entry?.hintsUsed ?? 0);
    const difficulty = typeof entry?.difficulty === 'string' ? entry.difficulty : 'medium';
    const safeName = name.slice(0, 24);

    return {
      name: safeName,
      playerName: safeName,
      time: Number.isFinite(timeValue) ? Math.max(0, timeValue) : 0,
      difficulty,
      hints: Number.isFinite(hintsValue) ? Math.max(0, hintsValue) : 0,
      hintsUsed: Number.isFinite(hintsValue) ? Math.max(0, hintsValue) : 0,
    };
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
        .map(normalizeLeaderboardEntry)
        .filter(entry => Number.isFinite(entry.time) && Number.isFinite(entry.hints));
    } catch (error) {
      return [];
    }
  }

  function saveLeaderboard(entries) {
    const safeEntries = (entries || []).map((entry) => {
      const normalized = normalizeLeaderboardEntry(entry);
      return {
        name: normalized.name,
        time: normalized.time,
        difficulty: normalized.difficulty,
        hints: normalized.hints,
      };
    });

    try {
      window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(safeEntries));
    } catch (error) {
      // localStorage may be unavailable; keep the in-memory leaderboard behavior working without exposing the error.
    }
  }

  function sortLeaderboard(entries) {
    return [...entries].sort((first, second) => {
      if (first.time !== second.time) {
        return first.time - second.time;
      }
      if (first.hints !== second.hints) {
        return first.hints - second.hints;
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
        <td>${window.SudokuTimer.formatTime(entry.time)}</td>
        <td>${entry.difficulty}</td>
        <td>${entry.hints}</td>
      `;
      body.appendChild(row);
    });
  }

  function addLeaderboardEntry(entry) {
    const safeEntry = normalizeLeaderboardEntry(entry);
    const entries = limitLeaderboard([...getStoredLeaderboard(), safeEntry]);
    saveLeaderboard(entries);
    renderLeaderboard();
  }

  window.SudokuStorage = {
    LEADERBOARD_KEY,
    getStoredLeaderboard,
    saveLeaderboard,
    sortLeaderboard,
    limitLeaderboard,
    renderLeaderboard,
    addLeaderboardEntry,
    normalizeLeaderboardEntry,
  };
})();
