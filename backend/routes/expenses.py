from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.category import Category
from backend.models.expense import Expense
from backend.models.user import User
from backend.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
)
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


@router.get("/", response_model=List[ExpenseResponse])
def list_expenses(
    month: Optional[str] = Query(default=None),
    category_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Expense]:
    query = db.query(Expense).filter(Expense.user_id == current_user.id)

    if month:
        start, end = _month_bounds(month)
        query = query.filter(and_(Expense.date >= start, Expense.date < end))

    if category_id is not None:
        query = query.filter(Expense.category_id == category_id)

    return query.order_by(Expense.date.desc(), Expense.id.desc()).all()


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Expense:
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

    expense = Expense(
        user_id=current_user.id,
        category_id=payload.category_id,
        amount=payload.amount,
        description=payload.description,
        date=payload.date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Expense:
    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
        )
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    if payload.category_id is not None:
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
        expense.category_id = payload.category_id

    if payload.amount is not None:
        expense.amount = payload.amount
    if payload.description is not None:
        expense.description = payload.description
    if payload.date is not None:
        from datetime import date as date_type
        expense.date = date_type.fromisoformat(payload.date)

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
        )
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    db.delete(expense)
    db.commit()
    return {"message": "Deleted"}

