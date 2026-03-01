import { useMemo, useState } from "react"
import { Pencil, Receipt, Trash2 } from "lucide-react"

import api from "../api/axios"
import { formatCurrency, getLast6Months } from "../utils/helpers"

function toDate(value) {
  if (!value) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

function formatExpenseDate(value) {
  const d = toDate(value)
  if (!d) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d)
}

function getCategoryName(expense, categoriesById) {
  const cid = expense?.category_id ?? expense?.categoryId ?? null
  if (cid != null && categoriesById[String(cid)]) return categoriesById[String(cid)]
  return (
    expense?.category?.name ||
    expense?.category_name ||
    expense?.categoryName ||
    (cid != null ? `Category ${cid}` : "—")
  )
}

function toYmd(value) {
  if (!value) return ""
  if (typeof value === "string") return value.slice(0, 10)
  const d = toDate(value)
  if (!d) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function ExpenseTable({
  expenses = [],
  categories = [],
  onRefresh,
  currentMonth,
  onMonthChange,
}) {
  const monthOptions = useMemo(() => getLast6Months(), [])
  const [internalMonth, setInternalMonth] = useState(monthOptions[0] || "")
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const selectedMonth = currentMonth || internalMonth

  const categoriesById = useMemo(
    () =>
      (categories || []).reduce((acc, c) => {
        if (c?.id == null) return acc
        acc[String(c.id)] = c?.name || `Category ${c.id}`
        return acc
      }, {}),
    [categories],
  )

  const totalDisplayed = useMemo(
    () =>
      expenses.reduce((sum, e) => sum + Number(e?.amount ?? 0), 0),
    [expenses],
  )

  async function handleDelete(id) {
    await api.delete(`/expenses/${id}`)
    setDeletingId(null)
    if (typeof onRefresh === "function") await onRefresh(selectedMonth)
  }

  async function handleSave(edit) {
    console.log("Edit object:", edit)
    
    const payload = {
      amount: edit.amount === "" ? undefined : Number(edit.amount),
      description: edit.description?.trim() ? edit.description.trim() : null,
      category_id: edit.category_id ? Number(edit.category_id) : undefined,
      date: edit.date ? edit.date.slice(0, 10) : undefined,
    }
    
    // Remove undefined fields
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k]
    })

    console.log("Final payload being sent:", payload)

    try {
      const response = await api.put(`/expenses/${edit.id}`, payload)
      console.log("Success:", response.data)
      setEditingExpense(null)
      if (typeof onRefresh === "function") await onRefresh(selectedMonth)
     } catch(err) {
      console.log("Full error response:", err?.response?.data)
      const detail = err?.response?.data?.detail
      let message
      if (Array.isArray(detail)) {
        message = detail.map(d => `${d.loc?.join('.')} - ${d.msg}`).join(', ')
      } else if (typeof detail === 'string') {
        message = detail
      } else {
        message = err?.message || "Unable to save changes."
      }
      throw new Error(message)
    }
  }

  function handleMonthChange(next) {
    if (onMonthChange) {
      onMonthChange(next)
     } else {
      setInternalMonth(next)
      if (typeof onRefresh === "function") onRefresh(next)
    }
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-blue-400" />
          <h3 className="text-base font-semibold text-white">My Expenses</h3>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Month</span>
          <select
            className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
           >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm font-semibold text-gray-200">
          Total: {formatCurrency(totalDisplayed)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-gray-400">
                  <div className="text-2xl">🧾</div>
                  <div className="mt-2">No expenses found for this month</div>
                </td>
              </tr>
             ) : (
              expenses.map((e) => {
                const catName = getCategoryName(e, categoriesById)
                const desc = e?.description?.trim() ? e.description.trim() : "—"
                const isConfirming = deletingId === e.id

                return (
                  <>
                    <tr
                      key={e.id}
                      className="border-b border-gray-700 hover:bg-gray-700/20"
                    >
                      <td className="whitespace-nowrap px-3 py-3 text-gray-200">
                        {formatExpenseDate(e?.date)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-purple-900/50 px-2 py-1 text-xs text-purple-300">
                          {catName}
                        </span>
                      </td>
                      <td className="max-w-[320px] truncate px-3 py-3 text-gray-400">
                        {desc}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-green-400">
                        {formatCurrency(e?.amount ?? 0)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingExpense({
                                id: e.id,
                                amount: e?.amount ?? "",
                                description: e?.description ?? "",
                                category_id: String(e?.category_id ?? ""),
                                date: toYmd(e?.date),
                              })
                            }
                            className="rounded-md p-2 text-gray-300 hover:bg-gray-700/40 hover:text-white"
                            aria-label="Edit expense"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(e.id)}
                            className="rounded-md p-2 text-gray-300 hover:bg-gray-700/40 hover:text-red-400"
                            aria-label="Delete expense"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isConfirming ? (
                      <tr key={`${e.id}-confirm`} className="border-b border-gray-700">
                        <td colSpan={5} className="bg-red-900/30 px-3 py-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-red-200">
                              Delete this expense permanently?
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDelete(e.id)}
                                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="rounded-lg border border-gray-600 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-gray-500 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {editingExpense ? (
        <EditModal
          expense={editingExpense}
          categories={categories}
          onClose={() => setEditingExpense(null)}
          onSave={handleSave}
        />
      ) : null}
    </div>
  )
}

function EditModal({ expense, categories, onClose, onSave }) {
  const [form, setForm] = useState(expense)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      await onSave(form)
    } catch (err) {
      const detail = err?.response?.data?.detail
      let message
      if (Array.isArray(detail)) {
        message = detail.map(d => d.msg || d.message).join(', ')
      } else if (typeof detail === 'string') {
        message = detail
      } else {
        message = err?.message || "Unable to save changes."
      }
      setError(message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-white">Edit Expense</h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-300 hover:bg-gray-700/40 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Amount
              </label>
              <div className="flex overflow-hidden rounded-lg border border-gray-600 bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500">
                <div className="flex items-center px-3 text-gray-300">₹</div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full bg-transparent p-3 text-white outline-none"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Category
              </label>
              <select
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                required
              >
                {(categories || []).map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Description (optional)
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={form.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What did you spend on?"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-600 px-4 py-3 text-sm font-semibold text-gray-200 hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

