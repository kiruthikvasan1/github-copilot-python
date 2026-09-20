import copy
import random

SIZE = 9
EMPTY = 0
DIFFICULTY_LEVELS = {
    'easy': 45,
    'medium': 35,
    'hard': 25,
}


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def is_valid_placement(board, row, col, num):
    if num == EMPTY:
        return True
    if not 1 <= num <= SIZE:
        return False
    for x in range(SIZE):
        if x != col and board[row][x] == num:
            return False
    for y in range(SIZE):
        if y != row and board[y][col] == num:
            return False
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            cell_row = start_row + i
            cell_col = start_col + j
            if (cell_row != row or cell_col != col) and board[cell_row][cell_col] == num:
                return False
    return True


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def find_empty_cell(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def count_solutions(board, limit=2):
    board = deep_copy(board)
    solutions = 0

    # Backtracking explores each valid candidate while stopping early once the
    # configured solution limit is reached, which is the core uniqueness check.
    def backtrack():
        nonlocal solutions
        if solutions >= limit:
            return

        empty_cell = find_empty_cell(board)
        if empty_cell is None:
            solutions += 1
            return

        row, col = empty_cell
        for num in range(1, SIZE + 1):
            if not is_safe(board, row, col, num):
                continue
            board[row][col] = num
            backtrack()
            board[row][col] = EMPTY
            if solutions >= limit:
                return

    backtrack()
    return solutions


def is_unique_solution(board):
    return count_solutions(board, limit=2) == 1


def find_hint_move(board, solution):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col, solution[row][col]
    return None


def remove_cells(board, clues):
    filled = sum(cell != EMPTY for row in board for cell in row)
    cells = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(cells)

    # A clue can be removed only when the board still has exactly one valid completion.
    for row, col in cells:
        if filled <= clues:
            break
        if board[row][col] == EMPTY:
            continue
        original = board[row][col]
        board[row][col] = EMPTY
        if is_unique_solution(board):
            filled -= 1
        else:
            board[row][col] = original

    return filled == clues


def generate_puzzle(clues=35):
    if clues not in DIFFICULTY_LEVELS.values() and clues <= 0:
        raise ValueError('clues must be a positive number of filled cells')

    for _ in range(200):
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        puzzle = deep_copy(board)

        if remove_cells(puzzle, clues) and is_unique_solution(puzzle):
            return puzzle, solution

    raise RuntimeError(f'Unable to generate a unique Sudoku puzzle with {clues} clues')
