import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, ChevronDown, ChevronUp, Plus } from "lucide-react"

import api from "../api/axios"

function todayYmd() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function Spinner() {
  return (
    <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

export default function ExpenseForm({ categories = [], onSuccess }) {
  const categoryOptions = useMemo(
    () =>
      (categories || []).map((c) => ({
        id: String(c.id),
        name: c.name,
      })),
    [categories],
  )

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: categoryOptions?.[0]?.id ?? "",
    date: todayYmd(),
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState("")

  useEffect(() => {
    // If categories load later, pick the first one by default (only if none selected)
    if (!formData.category_id && categoryOptions.length > 0) {
      setFormData((prev) => ({ ...prev, category_id: categoryOptions[0].id }))
    }
  }, [categoryOptions, formData.category_id])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(false), 2000)
    return () => clearTimeout(t)
  }, [success])

  const canSubmit = useMemo(() => {
    const amt = Number(formData.amount)
    if (loading) return false
    if (!formData.category_id) return false
    if (!formData.date) return false
    if (!Number.isFinite(amt) || amt <= 0) return false
    return true
  }, [formData, loading])

  function updateField(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    const amt = Number(formData.amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be greater than 0.")
      return
    }
    if (!formData.category_id) {
      setError("Please select a category.")
      return
    }

    setLoading(true)
    try {
      await api.post("/expenses/", {
        amount: amt,
        description: formData.description?.trim() || null,
        category_id: Number(formData.category_id),
        date: formData.date,
      })

      setFormData((prev) => ({
        ...prev,
        amount: "",
        description: "",
        date: todayYmd(),
      }))
      setSuccess(true)
      if (typeof onSuccess === "function") await onSuccess()
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to add expense right now."
      setError(String(message))
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    setCategoryError("")

    const name = newCategoryName.trim()
    if (!name) {
      setCategoryError("Please enter a category name.")
      return
    }

    setAddingCategory(true)
    try {
      await api.post("/categories/", { name })
      setNewCategoryName("")
      if (typeof onSuccess === "function") await onSuccess()
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to add category right now."
      setCategoryError(String(message))
    } finally {
      setAddingCategory(false)
    }
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6">
      <div className="mb-5 flex items-center gap-2">
        <Plus size={18} className="text-blue-400" />
        <h3 className="text-base font-semibold text-white">Add Expense</h3>
      </div>

      {categoryOptions.length === 0 ? (
        <div className="mb-4 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-200">
          Add a category first.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="0.00"
                className="w-full bg-transparent p-3 text-white outline-none"
                value={formData.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Category
            </label>
            <select
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              value={formData.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
              disabled={categoryOptions.length === 0}
              required
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="What did you spend on?"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spinner /> : null}
          {loading ? "Adding..." : "Add Expense"}
        </button>

        {success ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-200">
            <CheckCircle2 size={18} className="text-green-400" />
            Expense added!
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}
      </form>

      <div className="mt-6 border-t border-gray-700 pt-4">
        <button
          type="button"
          onClick={() => setShowAddCategory((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700/40"
        >
          <span>Add Category</span>
          {showAddCategory ? (
            <ChevronUp size={18} className="text-gray-300" />
          ) : (
            <ChevronDown size={18} className="text-gray-300" />
          )}
        </button>

        {showAddCategory ? (
          <form onSubmit={handleAddCategory} className="mt-3 space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Category name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Groceries"
                required
              />
            </div>

            <button
              type="submit"
              disabled={addingCategory}
              className="w-full rounded-lg border border-gray-600 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addingCategory ? "Adding..." : "Add"}
            </button>

            {categoryError ? (
              <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-400">
                {categoryError}
              </div>
            ) : null}
          </form>
        ) : null}
      </div>
    </div>
  )
}

