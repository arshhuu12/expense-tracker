import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatCurrency } from "../utils/helpers"

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]

function toYmd(value) {
  if (!value) return null
  if (typeof value === "string") return value.slice(0, 10)
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, "0")
    const d = String(value.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  return null
}

export default function SpendingChart({ expenses = [], categories = [] }) {
  const categoriesById = categories.reduce((acc, c) => {
    if (c?.id == null) return acc
    acc[String(c.id)] = c?.name || `Category ${c.id}`
    return acc
  }, {})

  const byCategoryId = expenses.reduce((acc, e) => {
    const cid = e?.category_id ?? e?.categoryId ?? null
    if (cid == null) return acc
    const key = String(cid)
    acc[key] = (acc[key] ?? 0) + Number(e?.amount ?? 0)
    return acc
  }, {})

  const pieData = Object.entries(byCategoryId)
    .map(([categoryId, total]) => ({
      categoryId,
      name: categoriesById[categoryId] || `Category ${categoryId}`,
      value: Number(total) || 0,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const byDay = expenses.reduce((acc, e) => {
    const ymd = toYmd(e?.date)
    if (!ymd) return acc
    acc[ymd] = (acc[ymd] ?? 0) + Number(e?.amount ?? 0)
    return acc
  }, {})

  const barData = Object.entries(byDay)
    .map(([ymd, amount]) => ({
      ymd,
      day: ymd.slice(-2),
      amount: Number(amount) || 0,
    }))
    .sort((a, b) => a.ymd.localeCompare(b.ymd))

  const hasExpenses = expenses.length > 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl bg-gray-800 p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">
            Spending by Category
          </h3>
        </div>

        {!hasExpenses || pieData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
            No expense data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
              >
                {pieData.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={COLORS[idx % COLORS.length]}
                    stroke="rgba(0,0,0,0)"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, props) => [
                  formatCurrency(value),
                  props?.payload?.name || "Category",
                ]}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl bg-gray-800 p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">Daily Spending</h3>
        </div>

        {!hasExpenses || barData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
            No expense data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
                tickFormatter={(v) => `₹${Number(v).toFixed(0)}`}
              />
              <Tooltip
                labelFormatter={(_label, items) => items?.[0]?.payload?.ymd || ""}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

