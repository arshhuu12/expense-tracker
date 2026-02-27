from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="categories")
    expenses = relationship(
        "Expense",
        back_populates="category",
        cascade="all, delete-orphan",
    )
    budgets = relationship(
        "Budget",
        back_populates="category",
        cascade="all, delete-orphan",
    )

