from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    clues = int(request.args.get('clues', 35))
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    if not isinstance(board, list) or len(board) != sudoku_logic.SIZE:
        return jsonify({'error': 'Invalid board'}), 400

    # Treat every empty or mismatched cell as invalid so the UI can highlight the full set.
    invalid = []
    for i in range(sudoku_logic.SIZE):
        if not isinstance(board[i], list) or len(board[i]) != sudoku_logic.SIZE:
            return jsonify({'error': 'Invalid board'}), 400
        for j in range(sudoku_logic.SIZE):
            value = board[i][j]
            if value == sudoku_logic.EMPTY or value != solution[i][j]:
                invalid.append([i, j])

    return jsonify({'incorrect': invalid, 'invalid': invalid})


@app.route('/hint')
def hint_move():
    puzzle = CURRENT.get('puzzle')
    solution = CURRENT.get('solution')
    if puzzle is None or solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    # Any empty editable cell is a valid hint target; the flask endpoint only exposes one move.
    hint = sudoku_logic.find_hint_move(puzzle, solution)
    if hint is None:
        return jsonify({'message': 'No empty editable cells remain.'})

    row, col, value = hint
    if puzzle[row][col] != sudoku_logic.EMPTY:
        return jsonify({'message': 'No empty editable cells remain.'})

    puzzle[row][col] = value
    return jsonify({'row': row, 'col': col, 'value': value})


if __name__ == '__main__':
    app.run(debug=True)