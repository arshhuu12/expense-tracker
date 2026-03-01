import { useCallback, useEffect, useState } from "react"

import Navbar from "../components/Navbar"
import ExpenseForm from "../components/ExpenseForm"
import ExpenseTable from "../components/ExpenseTable"
import api from "../api/axios"
import { getCurrentMonth } from "../utils/helpers"

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(
    async (monthOverride) => {
      const month = monthOverride || currentMonth
      const res = await api.get(`/expenses/?month=${encodeURIComponent(month)}`)
      setExpenses(res.data || [])
    },
    [currentMonth],
  )

  const fetchCategories = useCallback(async () => {
    const res = await api.get("/categories/")
    setCategories(res.data || [])
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchExpenses(), fetchCategories()])
    } finally {
      setLoading(false)
    }
  }, [fetchExpenses, fetchCategories])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">My Expenses</h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="h-72 animate-pulse rounded-xl bg-gray-800/70" />
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 animate-pulse rounded-xl bg-gray-800/70" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ExpenseForm categories={categories} onSuccess={refreshAll} />
            </div>

            <div className="lg:col-span-2">
              <ExpenseTable
                expenses={expenses}
                categories={categories}
                onRefresh={refreshAll}
                currentMonth={currentMonth}
                onMonthChange={(month) => {
                  setCurrentMonth(month)
                  fetchExpenses(month)
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
