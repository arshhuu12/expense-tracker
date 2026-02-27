from pydantic import BaseModel


class ExpenseBase(BaseModel):
    id: int

