(function () {
  let timerInterval = null;
  let elapsedSeconds = 0;

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
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

  function getElapsedSeconds() {
    return elapsedSeconds;
  }

  function stopAndKeepCurrentTime() {
    stopTimer();
  }

  window.SudokuTimer = {
    formatTime,
    updateTimerDisplay,
    stopTimer,
    startTimer,
    getElapsedSeconds,
    stopAndKeepCurrentTime,
  };
})();
