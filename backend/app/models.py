from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field
from pydantic import StringConstraints
from typing_extensions import Annotated

NameStr = Annotated[
    str,
    StringConstraints(min_length=1, max_length=10, pattern=r"^[a-zA-Z0-9 ]+$"),
]


class ScoreCreate(BaseModel):
    name: NameStr = Field(..., description="Player name (alphanumeric and spaces only)")
    score: int = Field(..., ge=0, description="Non-negative score value")


class ScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: NameStr
    score: int
    date: datetime


class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rank: int
    name: NameStr
    score: int
    date: datetime


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
