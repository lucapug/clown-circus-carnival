from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import schemas
from .models import ScoreCreate


def create_score(db: Session, payload: ScoreCreate) -> schemas.Score:
    score = schemas.Score(name=payload.name, score=payload.score)
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


def get_leaderboard(db: Session, limit: int = 10) -> List[schemas.Score]:
    stmt = select(schemas.Score).order_by(schemas.Score.score.desc(), schemas.Score.created_at.asc()).limit(limit)
    return list(db.execute(stmt).scalars())
