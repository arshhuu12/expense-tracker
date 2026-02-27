from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend import models  # noqa: F401
from backend.routes import auth, categories, expenses, budget, insights

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with prefixes and tags
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(budget.router, prefix="/budget", tags=["Budget"])
app.include_router(insights.router, prefix="/insights", tags=["AI Insights"])

# Create all database tables
Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API Running"}
