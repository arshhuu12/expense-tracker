from datetime import date
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.category import Category
from backend.models.expense import Expense
from backend.models.user import User
from backend.utils.ai import get_spending_insights
from backend.utils.auth import get_current_user

router = APIRouter()


def _month_bounds(month: str) -> tuple[date, date]:
    try:
        year_str, month_str = month.split("-")
        year = int(year_str)
        month_num = int(month_str)
        start = date(year, month_num, 1)
        if month_num == 12:
            end = date(year + 1, 1, 1)
        else:
            end = date(year, month_num + 1, 1)
        return start, end
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid month format. Use YYYY-MM.",
        )


@router.post("/")
def generate_insights(
    month: str = Query(..., description="Month in YYYY-MM format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, object]:
    start, end = _month_bounds(month)

    rows = (
        db.query(Category.name, func.coalesce(func.sum(Expense.amount), 0.0))
        .join(Expense, Expense.category_id == Category.id)
        .filter(
            Category.user_id == current_user.id,
            Expense.user_id == current_user.id,
            and_(Expense.date >= start, Expense.date < end),
        )
        .group_by(Category.name)
        .all()
    )

    category_totals = {name: float(total) for name, total in rows}

    insights = get_spending_insights(category_totals, month)
    return {"month": month, "insights": insights}

