import { useCallback, useEffect, useState } from "react"

import Navbar from "../components/Navbar"
import SummaryCards from "../components/SummaryCards"
import SpendingChart from "../components/SpendingChart"
import BudgetStatus from "../components/BudgetStatus"
import AIInsights from "../components/AIInsights"
import api from "../api/axios"
import { formatCurrency, getCurrentMonth, getLast6Months } from "../utils/helpers"

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [budgetStatus, setBudgetStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())

  const monthOptions = getLast6Months()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [expensesRes, categoriesRes, budgetRes] = await Promise.all([
        api.get(`/expenses/?month=${encodeURIComponent(currentMonth)}`),
        api.get("/categories/"),
        api.get(`/budget/status?month=${encodeURIComponent(currentMonth)}`),
      ])

      setExpenses(expensesRes.data || [])
      setCategories(categoriesRes.data || [])
      setBudgetStatus(budgetRes.data || [])
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalForHeader = expenses.reduce(
    (sum, e) => sum + Number(e?.amount ?? 0),
    0,
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">
              Overview of your{" "}
              <span className="font-semibold text-white">{currentMonth}</span>{" "}
              spending
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Month</span>
              <select
                className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-300">
              Total this month:{" "}
              <span className="font-semibold text-white">
                {formatCurrency(totalForHeader)}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-28 animate-pulse rounded-xl bg-gray-800/70"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="h-80 animate-pulse rounded-xl bg-gray-800/70" />
              <div className="h-80 animate-pulse rounded-xl bg-gray-800/70" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-64 animate-pulse rounded-xl bg-gray-800/70" />
              <div className="h-64 animate-pulse rounded-xl bg-gray-800/70" />
            </div>
          </div>
        ) : (
          <>
            <section className="mb-6">
              <SummaryCards expenses={expenses} budgetStatus={budgetStatus} categories={categories} />
            </section>

            <section className="mb-6">
              <SpendingChart expenses={expenses} categories={categories} />
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BudgetStatus
                budgetStatus={budgetStatus}
                categories={categories}
                onRefresh={fetchData}
              />
              <AIInsights month={currentMonth} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}

