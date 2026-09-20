# Flask Sudoku Game

A small Flask web app for playing Sudoku with a generated unique-solution board, difficulty settings, hints, validation, timer, and a Top 10 local leaderboard.

## Features

- Unique-solution Sudoku generation
- Difficulty levels: Easy (45 clues), Medium (35 clues), Hard (25 clues)
- Locked prefilled cells and editable user entries
- Immediate row, column, and 3x3 conflict feedback
- Hint support with locked hint cells
- Check-button validation
- Completion detection and congratulatory message
- Timer for each game
- Top 10 fastest leaderboard stored in browser localStorage using `sudokuLeaderboard`
- Light and dark theme toggle with separate `sudokuTheme` storage
- Responsive layout for desktop and mobile

## Install

1. Open a terminal in the project folder.
2. Create and activate a virtual environment if needed.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Run the app

```bash
python app.py
```

Then open the app in a browser at:

```text
http://127.0.0.1:5000/
```

## Run tests

```bash
.\.venv\Scripts\python.exe -m pytest -q
```

If using a POSIX shell, the equivalent command is:

```bash
python -m pytest -q
```

## Notes

- The leaderboard persists in browser localStorage under `sudokuLeaderboard`.
- The theme preference is stored separately under `sudokuTheme`.
- No server-side database is used.
