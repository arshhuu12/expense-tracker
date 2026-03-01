from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    description: Optional[str] = None
    category_id: int
    date: date


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    category_id: Optional[int] = None
    date: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: Optional[str]
    category_id: int
    date: date
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

