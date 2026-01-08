from sqlalchemy import Column, DateTime, Index, Integer, String, func

from .database import Base


class Score(Base):
    __tablename__ = "scores"
    __table_args__ = (Index("idx_score_desc", "score"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(10), nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
