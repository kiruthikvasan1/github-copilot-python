import pytest

import sudoku_logic


def test_create_empty_board():
    board = sudoku_logic.create_empty_board()
    assert len(board) == 9
    assert all(len(row) == 9 for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_is_safe_detects_conflicts():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    board[0][1] = 5
    assert not sudoku_logic.is_safe(board, 0, 2, 5)

    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    board[1][0] = 5
    assert not sudoku_logic.is_safe(board, 2, 2, 5)

    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    board[1][1] = 5
    assert not sudoku_logic.is_safe(board, 0, 2, 5)

    board = sudoku_logic.create_empty_board()
    assert sudoku_logic.is_safe(board, 0, 0, 1)


def test_count_solutions_on_empty_board():
    board = sudoku_logic.create_empty_board()
    assert sudoku_logic.count_solutions(board, limit=2) == 2


def test_unique_solution_detection():
    board = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
    assert sudoku_logic.count_solutions(board, limit=2) == 1
    assert sudoku_logic.is_unique_solution(board)


def test_multiple_solution_board():
    board = [[0] * 9 for _ in range(9)]
    assert sudoku_logic.count_solutions(board, limit=2) == 2
    assert not sudoku_logic.is_unique_solution(board)


def test_is_valid_placement_rejects_conflicts():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    board[0][1] = 1
    board[1][0] = 2
    board[1][1] = 3
    board[0][2] = 4

    assert not sudoku_logic.is_valid_placement(board, 0, 2, 5)
    assert not sudoku_logic.is_valid_placement(board, 2, 0, 5)
    assert not sudoku_logic.is_valid_placement(board, 2, 2, 5)


def test_is_valid_placement_accepts_valid_moves():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    board[0][1] = 3
    board[1][0] = 6
    assert sudoku_logic.is_valid_placement(board, 0, 2, 7)
    assert sudoku_logic.is_valid_placement(board, 2, 0, 1)


def test_find_hint_move_fills_valid_empty_cell():
    puzzle = [
        [5, 3, 0, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
    solution = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
    hint = sudoku_logic.find_hint_move(puzzle, solution)
    assert hint == (0, 2, 4)


def test_find_hint_move_does_not_touch_prefilled_cells():
    puzzle = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
    assert sudoku_logic.find_hint_move(puzzle, puzzle) is None


def test_generated_puzzle_has_exactly_one_solution():
    for clues in [25, 35, 45]:
        for _ in range(5):
            puzzle, solution = sudoku_logic.generate_puzzle(clues)
            assert len(puzzle) == sudoku_logic.SIZE
            assert len(solution) == sudoku_logic.SIZE
            assert sudoku_logic.count_solutions(puzzle, limit=2) == 1
            assert sudoku_logic.is_unique_solution(puzzle)
            assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
            assert all(len(row) == sudoku_logic.SIZE for row in solution)


@pytest.mark.parametrize(
    ('difficulty', 'expected_clues'),
    [('easy', 45), ('medium', 35), ('hard', 25)],
)
def test_difficulty_generates_exact_clue_count(difficulty, expected_clues):
    clues = sudoku_logic.DIFFICULTY_LEVELS[difficulty]
    assert clues == expected_clues

    puzzle, _ = sudoku_logic.generate_puzzle(clues)
    filled_cells = sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row)
    assert filled_cells == expected_clues


@pytest.mark.parametrize(
    ('difficulty', 'expected_clues'),
    [('easy', 45), ('medium', 35), ('hard', 25)],
)
def test_difficulty_puzzle_has_unique_solution(difficulty, expected_clues):
    puzzle, _ = sudoku_logic.generate_puzzle(sudoku_logic.DIFFICULTY_LEVELS[difficulty])
    assert sudoku_logic.count_solutions(puzzle, limit=2) == 1
    assert sudoku_logic.is_unique_solution(puzzle)
    filled_cells = sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row)
    assert filled_cells == expected_clues


def test_generate_puzzle_default_api_still_works():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=35)
    assert isinstance(puzzle, list)
    assert isinstance(solution, list)
    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert all(len(row) == sudoku_logic.SIZE for row in solution)
    assert sudoku_logic.count_solutions(puzzle, limit=2) == 1
    assert puzzle != solution


@pytest.mark.parametrize('invalid_clues', [0, -1, -5])
def test_invalid_clue_counts_are_handled_safely(invalid_clues):
    with pytest.raises(ValueError):
        sudoku_logic.generate_puzzle(clues=invalid_clues)
