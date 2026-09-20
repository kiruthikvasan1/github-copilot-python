(function () {
  const THEME_KEY = 'sudokuTheme';

  function getStoredTheme() {
    try {
      const savedTheme = window.localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (error) {
      // localStorage is unavailable: fall back to the browser's preferred color scheme.
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
      // localStorage may be unavailable; keep the theme change in memory and continue.
    }

    applyTheme(nextTheme);
  }

  window.SudokuTheme = {
    THEME_KEY,
    getStoredTheme,
    applyTheme,
    initializeTheme,
    toggleTheme,
  };
})();
