import os
from functools import lru_cache
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "circus_scores.db"


class Settings:
    def __init__(self) -> None:
        db_path = Path(os.getenv("CIRCUS_DB_PATH", DEFAULT_DB_PATH))
        self.database_url = f"sqlite:///{db_path}"
        self.api_base_url = os.getenv("API_BASE_URL", "http://localhost:8000")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


def reset_settings_cache() -> None:
    get_settings.cache_clear()
