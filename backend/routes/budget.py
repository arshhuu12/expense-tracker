from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.budget import Budget
from backend.models.category import Category
from backend.models.expense import Expense
from backend.models.user import User
from backend.schemas.budget import BudgetCreate, BudgetResponse, BudgetStatus
from backend.utils.auth import get_current_user

router = APIRouter()


def _month_bounds(month: str) -> tuple[date, date]:
    from backend.routes.expenses import _month_bounds as _expense_month_bounds

    # Reuse the same logic to keep behavior consistent
    return _expense_month_bounds(month)


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def upsert_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Budget:
    category = (
        db.query(Category)
        .filter(
            Category.id == payload.category_id,
            Category.user_id == current_user.id,
        )
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category_id == payload.category_id,
            Budget.month == payload.month,
        )
        .first()
    )

    if budget:
        budget.monthly_limit = payload.monthly_limit
    else:
        budget = Budget(
            user_id=current_user.id,
            category_id=payload.category_id,
            monthly_limit=payload.monthly_limit,
            month=payload.month,
        )
        db.add(budget)

    db.commit()
    db.refresh(budget)
    return budget


@router.get("/status", response_model=List[BudgetStatus])
def budget_status(
    month: str = Query(..., description="Month in YYYY-MM format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BudgetStatus]:
    start, end = _month_bounds(month)

    budgets = (
        db.query(Budget)
        .join(Category, Category.id == Budget.category_id)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == month,
        )
        .all()
    )

    # Aggregate expenses per category for the given month
    expense_rows = (
        db.query(Expense.category_id, func.coalesce(func.sum(Expense.amount), 0.0))
        .filter(
            Expense.user_id == current_user.id,
            and_(Expense.date >= start, Expense.date < end),
        )
        .group_by(Expense.category_id)
        .all()
    )
    spent_by_category = {cat_id: float(total) for cat_id, total in expense_rows}

    statuses: list[BudgetStatus] = []
    for budget in budgets:
        spent = spent_by_category.get(budget.category_id, 0.0)
        remaining = budget.monthly_limit - spent
        percentage_used = (spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0.0
        is_warning = percentage_used >= 80.0

        statuses.append(
            BudgetStatus(
                category_name=budget.category.name,
                monthly_limit=budget.monthly_limit,
                spent=spent,
                remaining=remaining,
                percentage_used=percentage_used,
                is_warning=is_warning,
            )
        )

    return statuses

