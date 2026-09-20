# Flask Sudoku Project Instructions

## Project Context

This repository contains a Flask-based Sudoku web application. The application generates valid Sudoku puzzles with exactly one unique solution. It supports Easy, Medium, and Hard difficulty levels.

- Easy uses 45 clues.
- Medium uses 35 clues.
- Hard uses 25 clues.
- Prefilled cells are locked and cannot be edited by the user.
- The app provides immediate invalid-entry feedback.
- The app provides Hint and Check functionality.
- Check must highlight all missing and incorrect editable cells.
- The app includes a timer for each puzzle.
- Completed games are stored in a Top 10 leaderboard using browser localStorage.
- The app supports light and dark modes.
- The Sudoku grid uses alternating 3x3 box colors.
- The UI must remain responsive on both desktop and mobile.

## Technology Stack

- Backend: Python 3 and Flask
- Sudoku logic: Python
- Frontend: HTML, vanilla JavaScript, and plain CSS
- Testing: pytest
- Browser storage: localStorage
- Do not introduce React, jQuery, or unnecessary frameworks.

## Project Structure

- app.py: Flask app and route handlers.
- sudoku_logic.py: Sudoku generation, solving, validation, and uniqueness logic.
- static/main.js: frontend game behavior.
- static/styles.css: styling, responsiveness, and dark-mode behavior.
- templates/index.html: UI markup.
- tests/: pytest-based automated tests.
- screenshot/: Copilot workflow and project evidence screenshots.

## Coding Conventions

- Use clear snake_case names for Python variables and functions.
- Keep functions focused on one responsibility.
- Keep Flask route handlers as thin as practical.
- Put reusable business logic outside route handlers.
- Avoid duplicated logic.
- Add comments only for non-obvious logic.
- Preserve existing public function names and behavior where possible.
- Prefer simple, readable solutions over unnecessary abstraction.

## Error Handling

- Never silently ignore exceptions.
- Do not use except/pass for failures.
- Validate incoming request data.
- Handle invalid difficulty values explicitly.
- Handle missing or malformed request data safely.
- Return meaningful error messages and appropriate HTTP status codes for API errors.
- Handle invalid board data safely.
- Handle missing active-game state safely.
- Do not expose sensitive internal information in error responses.

## Sudoku Rules

- The board is 9x9.
- 0 represents an empty cell.
- Values must be 1 through 9.
- Every generated puzzle must have exactly one solution.
- Use solution counting/backtracking to verify uniqueness.
- Difficulty must preserve the required clue counts.
- Prefilled cells must remain locked.
- Hint must fill a valid empty editable cell using the stored solution and lock it.
- Check must identify missing and incorrect editable cells without revealing the solution.

## Testing Rules

- Use pytest.
- Run the complete test suite after significant changes.
- Do not remove tests just to make the suite pass.
- Add regression tests for new behavior.
- Preserve tests for puzzle uniqueness, difficulty, validation, Hint, Check, timer-related behavior, and other existing functionality.
- Existing functionality must not be broken by refactoring.

## Frontend Rules

- Preserve responsive desktop/mobile behavior.
- Preserve alternating 3x3 box colors.
- Preserve light/dark mode readability.
- Preserve accessible labels and aria-invalid feedback.
- Preserve the existing invalid-cell styling.
- Do not make unrelated UI changes.

## What Not to Do

- Do not remove existing features.
- Do not replace the unique-solution Sudoku generator with a hard-coded puzzle.
- Do not introduce unnecessary frameworks.
- Do not silently swallow errors.
- Do not weaken or delete tests.
- Do not change tests simply to hide implementation problems.
- Do not make unrelated changes.
- Do not change working features unless explicitly requested.

## Working Expectations for Copilot

When generating or modifying code in this project:

1. Preserve the current Flask architecture and play flow.
2. Keep the Sudoku generator and uniqueness enforcement intact.
3. Keep puzzle difficulty logic at the required clue counts.
4. Respect locked-cell behavior and input validation rules.
5. Maintain the existing timer, leaderboard, and localStorage behavior.
6. Preserve dark mode, responsiveness, and alternating 3x3 box colors.
7. Prefer small, focused changes with clear intent.
8. Add or update tests when behavior changes.
9. Do not widen the scope beyond the requested change.

This project should remain a simple, readable Flask Sudoku game without unnecessary framework churn or major redesigns.
