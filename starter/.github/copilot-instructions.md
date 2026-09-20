# Copilot Instructions for the Flask Sudoku Project

## Project Context

This repository is a Flask-based Sudoku web application. It generates valid Sudoku puzzles with exactly one unique solution and supports Easy, Medium, and Hard modes.

- Easy: 45 clues
- Medium: 35 clues
- Hard: 25 clues
- Prefilled cells are locked.
- The application provides immediate invalid-entry feedback.
- It provides Hint and Check functionality.
- Check highlights all missing and incorrect editable cells.
- The application has a timer.
- Completed games are stored in a Top 10 leaderboard using browser localStorage.
- The application supports light and dark modes.
- The Sudoku grid uses alternating 3x3 box colors.
- The UI must remain responsive on desktop and mobile.

## Technology Stack

- Backend: Python 3 and Flask
- Sudoku logic: Python
- Frontend: HTML, vanilla JavaScript, and plain CSS
- Testing: pytest
- Browser storage: localStorage
- Do not introduce React, jQuery, or unnecessary frameworks.

## Project Structure

- app.py: Flask application and route handlers.
- sudoku_logic.py: Sudoku generation, solving, validation, and uniqueness logic.
- static/main.js: frontend game behavior.
- static/styles.css: styling and responsive/dark-mode behavior.
- templates/index.html: application UI.
- tests/: automated pytest tests.
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

## Guidance for Future Changes

When working on this project, Copilot should:

1. Preserve the current Flask architecture and game flow.
2. Keep the Sudoku generator and uniqueness logic intact.
3. Keep difficulty settings aligned with the required clue counts.
4. Respect locked-cell behavior and validation rules.
5. Maintain timer, leaderboard, and localStorage behavior.
6. Preserve dark mode, responsive behavior, and alternating 3x3 box colors.
7. Prefer small, focused changes over redesigns.
8. Add or update tests when behavior changes.
9. Do not broaden scope beyond the requested task.

This project is intentionally simple and readable; avoid unnecessary abstractions, framework churn, or unrelated refactors.
