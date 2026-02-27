from pydantic import BaseModel


class BudgetBase(BaseModel):
    id: int

