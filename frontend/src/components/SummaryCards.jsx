import { AlertTriangle, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"

import { formatCurrency } from "../utils/helpers"

export default function SummaryCards({ expenses = [], budgetStatus = [], categories = [] }) {
  const totalSpent = expenses.reduce(
    (sum, e) => sum + Number(e?.amount ?? 0),
    0,
  )

  const transactionCount = expenses.length

  const totalsByCategory = expenses.reduce((acc, e) => {
    const cat = categories.find(c => Number(c.id) === Number(e.category_id))
    const name = cat ? cat.name : null
    if (!name) return acc
    acc[name] = (acc[name] ?? 0) + Number(e?.amount ?? 0)
    return acc
  }, {})

  const topCategory =
    Object.keys(totalsByCategory).reduce((best, key) => {
      if (!best) return key
      return totalsByCategory[key] > totalsByCategory[best] ? key : best
    }, null) || "None"

  const budgetAlerts = budgetStatus.filter(
    (b) => Number(b?.percentage_used ?? 0) > 80,
  ).length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-gray-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Spent</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatCurrency(totalSpent)}
            </p>
            <p className="mt-1 text-sm text-gray-500">This month</p>
          </div>
          <div className="rounded-full bg-blue-600/20 p-3 text-blue-400">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">Transactions</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {transactionCount}
            </p>
            <p className="mt-1 text-sm text-gray-500">This month</p>
          </div>
          <div className="rounded-full bg-purple-600/20 p-3 text-purple-400">
            <ShoppingCart size={20} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">Top Category</p>
            <p className="mt-2 truncate text-2xl font-bold text-white">
              {topCategory}
            </p>
            <p className="mt-1 text-sm text-gray-500">Highest spend</p>
          </div>
          <div className="rounded-full bg-green-600/20 p-3 text-green-400">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      <div
        className={[
          "rounded-xl bg-gray-800 p-6",
          budgetAlerts > 0 ? "border border-red-500/30" : "",
        ].join(" ")}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">Budget Alerts</p>
            <p className="mt-2 text-2xl font-bold text-white">{budgetAlerts}</p>
            <p className="mt-1 text-sm text-gray-500">
              {budgetAlerts > 0 ? "Over 80% limit" : "All good"}
            </p>
          </div>
          <div
            className={[
              "rounded-full p-3",
              budgetAlerts > 0
                ? "bg-red-600/20 text-red-400"
                : "bg-green-600/20 text-green-400",
            ].join(" ")}
          >
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}

