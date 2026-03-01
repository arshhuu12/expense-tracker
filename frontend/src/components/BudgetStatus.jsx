import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Target } from "lucide-react"

import api from "../api/axios"
import { formatCurrency, getCurrentMonth } from "../utils/helpers"

function clampPct(value) {
  const n = Number(value ?? 0)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function barColor(pct) {
  if (pct < 60) return "bg-green-500"
  if (pct <= 80) return "bg-yellow-500"
  return "bg-red-500"
}

export default function BudgetStatus({
  budgetStatus = [],
  categories = [],
  onRefresh,
}) {
  const [categoryId, setCategoryId] = useState(
    categories?.[0]?.id != null ? String(categories[0].id) : "",
  )
  const [monthlyLimit, setMonthlyLimit] = useState("")
  const [month, setMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const hasBudgets = budgetStatus.length > 0

  const categoryOptions = useMemo(
    () =>
      (categories || []).map((c) => ({
        id: String(c.id),
        name: c.name,
      })),
    [categories],
  )

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.post("/budget/", {
        category_id: Number(categoryId),
        monthly_limit: Number(monthlyLimit),
        month,
      })

      setMonthlyLimit("")
      if (typeof onRefresh === "function") await onRefresh()
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to set budget right now."
      setError(String(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6">
      <div className="mb-5 flex items-center gap-2">
        <Target size={18} className="text-blue-400" />
        <h3 className="text-base font-semibold text-white">Budget Status</h3>
      </div>

      {!hasBudgets ? (
        <div className="mb-6 text-sm text-gray-400">
          No budgets set yet.{" "}
          <Link to="/expenses" className="text-blue-400 hover:text-blue-300">
            Go to expenses
          </Link>
        </div>
      ) : null}

      {hasBudgets ? (
        <div className="space-y-5">
          {budgetStatus.map((b, idx) => {
            const pct = clampPct(b?.percentage_used)
            const fill = barColor(pct)

            return (
              <div key={`${b?.category_name ?? "cat"}-${idx}`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {b?.category_name || "Category"}
                    </span>
                    {b?.is_warning ? (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">
                        ⚠️ Over 80%
                      </span>
                    ) : null}
                  </div>
                  <span className="text-sm text-gray-300">
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-gray-700">
                  <div
                    className={[
                      "h-3 rounded-full transition-all duration-500",
                      fill,
                    ].join(" ")}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {formatCurrency(b?.spent ?? 0)} of{" "}
                    {formatCurrency(b?.monthly_limit ?? 0)}
                  </span>
                  <span>{formatCurrency(b?.remaining ?? 0)} left</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      <div className="mt-8 border-t border-gray-700 pt-6">
        <h4 className="mb-3 text-sm font-semibold text-white">Set Budget</h4>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-300">
                Category
              </label>
              <select
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={categoryOptions.length === 0}
              >
                {categoryOptions.length === 0 ? (
                  <option value="">No categories</option>
                ) : (
                  categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-300">
                Monthly limit
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="e.g. 15000"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-300">
                Month
              </label>
              <input
                type="month"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || categoryOptions.length === 0}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Setting..." : "Set Budget"}
          </button>

          {error ? (
            <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  )
}

