from collections.abc import Generator
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


engine = None
SessionLocal = None


def configure_engine(database_url: Optional[str] = None) -> None:
    """Configure the global engine/session maker; usable in tests to swap DB."""

    global engine, SessionLocal

    settings = get_settings()
    url = database_url or settings.database_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}

    engine = create_engine(
        url,
        connect_args=connect_args,
        future=True,
    )
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


configure_engine()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from . import schemas  # noqa: F401  # ensure models are registered

    Base.metadata.create_all(bind=engine)
