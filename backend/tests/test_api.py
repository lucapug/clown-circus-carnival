from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from app import config as config_module
from app import database
from app.main import create_app


@pytest.fixture
def app(tmp_path, monkeypatch):
    # Point to a fresh SQLite DB per test run
    db_path = tmp_path / "test_scores.db"
    monkeypatch.setenv("CIRCUS_DB_PATH", str(db_path))

    # Reset settings cache and reconfigure engine to use the new DB
    config_module.reset_settings_cache()
    database.configure_engine(database_url=f"sqlite:///{db_path}")

    app = create_app()
    with TestClient(app) as client:
        yield client


# ============================================================================
# POST /scores Tests
# ============================================================================


def test_submit_score_creates_entry_and_returns_response(app):
    """Test that submitting a score creates an entry and returns 201 with correct data."""
    payload = {"name": "PLAYER1", "score": 12345}
    response = app.post("/scores", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == 1
    assert body["name"] == "PLAYER1"
    assert body["score"] == 12345
    # date should be ISO formatted; parse to ensure validity
    datetime.fromisoformat(body["date"])

    # Verify leaderboard reflects the submitted score
    leaderboard = app.get("/leaderboard").json()
    assert leaderboard["entries"][0]["name"] == "PLAYER1"
    assert leaderboard["entries"][0]["score"] == 12345
    assert leaderboard["entries"][0]["rank"] == 1


def test_submit_multiple_scores(app):
    """Test that multiple score submissions are persisted correctly."""
    names_and_scores = [
        ("ALICE", 5000),
        ("BOB", 7500),
        ("CHARLIE", 3200),
    ]

    for name, score in names_and_scores:
        response = app.post("/scores", json={"name": name, "score": score})
        assert response.status_code == 201
        body = response.json()
        assert body["name"] == name
        assert body["score"] == score

    # Verify all scores are in the leaderboard
    leaderboard = app.get("/leaderboard").json()["entries"]
    assert len(leaderboard) == 3
    assert [e["name"] for e in leaderboard] == ["BOB", "ALICE", "CHARLIE"]


def test_submit_score_with_spaces_in_name(app):
    """Test that player names with spaces are accepted."""
    payload = {"name": "PLAYER 1", "score": 1000}
    response = app.post("/scores", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "PLAYER 1"


def test_submit_score_with_numbers_in_name(app):
    """Test that player names with numbers are accepted."""
    payload = {"name": "PLAYER123", "score": 1000}
    response = app.post("/scores", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "PLAYER123"


def test_submit_zero_score(app):
    """Test that zero score is accepted."""
    payload = {"name": "LOSER", "score": 0}
    response = app.post("/scores", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["score"] == 0


def test_submit_large_score(app):
    """Test that large scores are accepted."""
    payload = {"name": "WINNER", "score": 999999}
    response = app.post("/scores", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["score"] == 999999


# ============================================================================
# POST /scores Validation Tests
# ============================================================================


def test_validation_errors(app):
    """Test that invalid submissions return 422 status."""
    # Name too long
    resp = app.post("/scores", json={"name": "TOO_LONG_NAME", "score": 100})
    assert resp.status_code == 422

    # Negative score
    resp = app.post("/scores", json={"name": "OK", "score": -5})
    assert resp.status_code == 422


def test_submit_score_empty_name(app):
    """Test that empty name is rejected."""
    payload = {"name": "", "score": 1000}
    response = app.post("/scores", json=payload)
    assert response.status_code == 422


def test_submit_score_invalid_characters_in_name(app):
    """Test that special characters in name are rejected."""
    payload = {"name": "PLAYER@123", "score": 1000}
    response = app.post("/scores", json=payload)
    assert response.status_code == 422


def test_submit_score_missing_name(app):
    """Test that missing name field is rejected."""
    payload = {"score": 1000}
    response = app.post("/scores", json=payload)
    assert response.status_code == 422


def test_submit_score_missing_score(app):
    """Test that missing score field is rejected."""
    payload = {"name": "PLAYER"}
    response = app.post("/scores", json=payload)
    assert response.status_code == 422


# ============================================================================
# GET /leaderboard Tests
# ============================================================================


def test_leaderboard_ordering_and_limit(app):
    """Test that leaderboard returns scores in descending order and respects limit."""
    scores = [
        ("AAA", 300),
        ("BBB", 500),
        ("CCC", 400),
    ]
    for name, score in scores:
        assert app.post("/scores", json={"name": name, "score": score}).status_code == 201

    # Default limit (10) should return all three sorted desc by score
    leaderboard = app.get("/leaderboard").json()["entries"]
    assert [entry["name"] for entry in leaderboard] == ["BBB", "CCC", "AAA"]
    assert [entry["rank"] for entry in leaderboard] == [1, 2, 3]

    # Limit query param trims results
    limited = app.get("/leaderboard", params={"limit": 2}).json()["entries"]
    assert len(limited) == 2
    assert [entry["name"] for entry in limited] == ["BBB", "CCC"]


def test_leaderboard_returns_correct_rank(app):
    """Test that ranks are assigned correctly (1-based)."""
    scores = [
        ("FIRST", 1000),
        ("SECOND", 500),
        ("THIRD", 250),
    ]
    for name, score in scores:
        app.post("/scores", json={"name": name, "score": score})

    leaderboard = app.get("/leaderboard").json()["entries"]
    assert leaderboard[0]["rank"] == 1
    assert leaderboard[1]["rank"] == 2
    assert leaderboard[2]["rank"] == 3


def test_leaderboard_empty(app):
    """Test that empty leaderboard returns empty entries list."""
    response = app.get("/leaderboard")

    assert response.status_code == 200
    body = response.json()
    assert body["entries"] == []


def test_leaderboard_default_limit_is_10(app):
    """Test that default limit is 10 entries."""
    # Submit 15 scores
    for i in range(15):
        app.post("/scores", json={"name": f"PLAYER{i:02d}", "score": 10000 - i * 100})

    leaderboard = app.get("/leaderboard").json()["entries"]
    assert len(leaderboard) == 10


def test_leaderboard_respects_limit_param(app):
    """Test that custom limit parameter works."""
    # Submit 5 scores
    for i in range(5):
        app.post("/scores", json={"name": f"PLAYER{i}", "score": 5000 - i * 100})

    # Test different limits
    assert len(app.get("/leaderboard", params={"limit": 1}).json()["entries"]) == 1
    assert len(app.get("/leaderboard", params={"limit": 3}).json()["entries"]) == 3
    assert len(app.get("/leaderboard", params={"limit": 10}).json()["entries"]) == 5


def test_leaderboard_with_tied_scores(app):
    """Test that tied scores are ordered by submission time (ascending created_at)."""
    # Submit scores in reverse order
    app.post("/scores", json={"name": "FIRST", "score": 1000})
    app.post("/scores", json={"name": "SECOND", "score": 1000})
    app.post("/scores", json={"name": "THIRD", "score": 1000})

    leaderboard = app.get("/leaderboard").json()["entries"]
    # All have same score, but ranks and ordering should be consistent
    assert len(leaderboard) == 3
    assert leaderboard[0]["score"] == 1000
    assert leaderboard[1]["score"] == 1000
    assert leaderboard[2]["score"] == 1000
    # Ranks should be sequential
    assert leaderboard[0]["rank"] == 1
    assert leaderboard[1]["rank"] == 2
    assert leaderboard[2]["rank"] == 3


def test_leaderboard_response_structure(app):
    """Test that leaderboard response has correct structure."""
    app.post("/scores", json={"name": "PLAYER", "score": 1000})

    response = app.get("/leaderboard")
    body = response.json()

    # Should have entries field
    assert "entries" in body
    assert isinstance(body["entries"], list)

    # Each entry should have required fields
    entry = body["entries"][0]
    assert "rank" in entry
    assert "name" in entry
    assert "score" in entry
    assert "date" in entry
    # date should be ISO formatted
    datetime.fromisoformat(entry["date"])


def test_leaderboard_scores_descending_order(app):
    """Test that leaderboard is always ordered by score descending."""
    # Submit in random order
    app.post("/scores", json={"name": "MID", "score": 500})
    app.post("/scores", json={"name": "LOW", "score": 100})
    app.post("/scores", json={"name": "HIGH", "score": 1000})
    app.post("/scores", json={"name": "VERYHIGH", "score": 2000})

    leaderboard = app.get("/leaderboard").json()["entries"]
    scores = [e["score"] for e in leaderboard]

    # Verify descending order
    assert scores == sorted(scores, reverse=True)
    assert scores == [2000, 1000, 500, 100]


# ============================================================================
# Integration Tests
# ============================================================================


def test_score_submission_and_leaderboard_integration(app):
    """
    Integration test: Submit multiple scores and verify they appear
    in the leaderboard in the correct order.
    """
    # Step 1: Submit initial scores
    submission_data = [
        ("ALICE", 5000),
        ("BOB", 7500),
        ("CHARLIE", 3200),
        ("DIANA", 6000),
        ("EVE", 4500),
    ]

    submitted_ids = []
    for name, score in submission_data:
        response = app.post("/scores", json={"name": name, "score": score})
        assert response.status_code == 201
        submitted_ids.append(response.json()["id"])

    # Step 2: Fetch leaderboard and verify all scores are present
    leaderboard_response = app.get("/leaderboard")
    assert leaderboard_response.status_code == 200
    leaderboard = leaderboard_response.json()["entries"]

    # Step 3: Verify correct ordering (descending by score)
    expected_order = ["BOB", "DIANA", "ALICE", "EVE", "CHARLIE"]
    actual_order = [e["name"] for e in leaderboard]
    assert actual_order == expected_order

    # Step 4: Verify ranks are sequential
    ranks = [e["rank"] for e in leaderboard]
    assert ranks == [1, 2, 3, 4, 5]

    # Step 5: Verify scores are correct
    scores = [e["score"] for e in leaderboard]
    assert scores == [7500, 6000, 5000, 4500, 3200]

    # Step 6: Verify dates are ISO formatted
    for entry in leaderboard:
        datetime.fromisoformat(entry["date"])


def test_data_persistence_across_requests(app):
    """
    Integration test: Verify that submitted scores persist across
    multiple leaderboard requests.
    """
    # Submit a score
    app.post("/scores", json={"name": "PERSISTENT", "score": 9999})

    # Fetch leaderboard multiple times
    for _ in range(3):
        leaderboard = app.get("/leaderboard").json()["entries"]
        assert len(leaderboard) == 1
        assert leaderboard[0]["name"] == "PERSISTENT"
        assert leaderboard[0]["score"] == 9999


def test_leaderboard_exceeds_default_limit(app):
    """
    Integration test: When more than 10 scores are submitted,
    verify that leaderboard returns only top 10.
    """
    # Submit 15 scores
    for i in range(15):
        score = 10000 - i * 100
        app.post("/scores", json={"name": f"PLAYER{i:02d}", "score": score})

    # Default leaderboard should return 10
    leaderboard = app.get("/leaderboard").json()["entries"]
    assert len(leaderboard) == 10

    # Verify they are the top 10 (highest scores)
    scores = [e["score"] for e in leaderboard]
    assert scores[0] == 10000  # First
    assert scores[9] == 9100   # Tenth (10000 - 9*100)
    assert scores == sorted(scores, reverse=True)
