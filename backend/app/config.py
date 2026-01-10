import os
from functools import lru_cache
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "circus_scores.db"


class Settings:
    def __init__(self) -> None:
        # Check if DATABASE_URL is set (used in containerized environments)
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            # Use the provided DATABASE_URL (e.g., Postgres in Docker)
            self.database_url = database_url
        else:
            # Fall back to SQLite for local development
            db_path = Path(os.getenv("CIRCUS_DB_PATH", DEFAULT_DB_PATH))
            self.database_url = f"sqlite:///{db_path}"
        
        self.api_base_url = os.getenv("API_BASE_URL", "http://localhost:8000")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


def reset_settings_cache() -> None:
    get_settings.cache_clear()
