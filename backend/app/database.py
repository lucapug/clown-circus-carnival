from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


def get_engine():
    settings = get_settings()
    return create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        future=True,
    )


def get_sessionmaker():
    return sessionmaker(bind=get_engine(), autoflush=False, autocommit=False, future=True)


SessionLocal = get_sessionmaker()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from . import schemas  # noqa: F401  # ensure models are registered

    engine = get_engine()
    Base.metadata.create_all(bind=engine)
