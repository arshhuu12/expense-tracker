from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category_id: int
    monthly_limit: float = Field(gt=0)
    month: str


class BudgetResponse(BaseModel):
    id: int
    category_id: int
    monthly_limit: float
    month: str
    user_id: int

    class Config:
        from_attributes = True


class BudgetStatus(BaseModel):
    category_name: str
    monthly_limit: float
    spent: float
    remaining: float
    percentage_used: float
    is_warning: bool

