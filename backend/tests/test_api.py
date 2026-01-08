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


def test_submit_score_creates_entry_and_returns_response(app):
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


def test_validation_errors(app):
    # Name too long
    resp = app.post("/scores", json={"name": "TOO_LONG_NAME", "score": 100})
    assert resp.status_code == 422

    # Negative score
    resp = app.post("/scores", json={"name": "OK", "score": -5})
    assert resp.status_code == 422


def test_leaderboard_ordering_and_limit(app):
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
