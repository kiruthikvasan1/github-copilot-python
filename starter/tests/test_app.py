import pytest
from app import app, CURRENT


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def reset_state():
    CURRENT["puzzle"] = None
    CURRENT["solution"] = None
    yield
    CURRENT["puzzle"] = None
    CURRENT["solution"] = None


def test_index_page(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Sudoku Game" in response.data
    assert b'id="timer"' in response.data
    assert b"Time: 00:00" in response.data


def test_new_game_route(client):
    response = client.get("/new?clues=35")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data["puzzle"], list)
    assert len(data["puzzle"]) == 9
    for row in data["puzzle"]:
        assert len(row) == 9
        assert all(0 <= cell <= 9 for cell in row)
    assert CURRENT["solution"] is not None
    assert CURRENT["puzzle"] == data["puzzle"]


def test_check_solution_with_correct_board(client):
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
    CURRENT["solution"] = board
    response = client.post("/check", json={"board": board})
    assert response.status_code == 200
    assert response.get_json()["incorrect"] == []


def test_check_solution_detects_incorrect_value_and_missing_editable_cells(client):
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
    board = [row[:] for row in solution]
    board[0][0] = 9
    board[0][2] = 0

    CURRENT["solution"] = solution
    response = client.post("/check", json={"board": board})

    assert response.status_code == 200
    assert response.get_json()["incorrect"] == [[0, 0], [0, 2]]


def test_check_solution_accepts_correct_values_and_ignores_valid_prefilled_cells(client):
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
    board = [row[:] for row in solution]
    board[0][0] = solution[0][0]
    board[0][1] = solution[0][1]
    board[8][8] = solution[8][8]

    CURRENT["solution"] = solution
    response = client.post("/check", json={"board": board})

    assert response.status_code == 200
    assert response.get_json()["incorrect"] == []


def test_check_solution_without_game(client):
    response = client.post("/check", json={"board": [[0] * 9 for _ in range(9)]})
    assert response.status_code == 400
    assert response.get_json()["error"] == "No game in progress"
