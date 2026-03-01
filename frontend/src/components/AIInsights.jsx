import { useMemo, useState } from "react"
import { RefreshCcw, Sparkles } from "lucide-react"

import api from "../api/axios"

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
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

function parseBullets(text) {
  if (!text) return []

  const lines = String(text)
    .split(/\r?\n|•/g)
    .map((l) => l.trim())
    .filter(Boolean)

  return lines.map((l) => l.replace(/^[-*]\s+/, ""))
}

export default function AIInsights({ month }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generated, setGenerated] = useState(false)

  const bullets = useMemo(() => parseBullets(insights), [insights])

  async function generate() {
    setLoading(true)
    setError(null)

    try {
      const res = await api.post(`/insights/?month=${encodeURIComponent(month)}`)
      const text = res?.data?.insights
      setInsights(text || "")
      setGenerated(true)
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to generate insights right now."
      setError(String(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6">
      <div className="mb-1 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            🤖 AI Spending Insights
          </h3>
          <p className="mt-1 text-sm text-gray-400">Powered by Grok</p>
        </div>

        {generated && !loading ? (
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-gray-500 hover:text-white"
          >
            <RefreshCcw size={16} />
            Regenerate
          </button>
        ) : null}
      </div>

      {!generated && !loading ? (
        <div className="mt-6 rounded-xl bg-gray-900/40 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-2xl">
            💡
          </div>
          <p className="text-sm text-gray-300">
            Get personalized insights about your{" "}
            <span className="font-semibold text-white">{month}</span> spending
          </p>
          <button
            type="button"
            onClick={generate}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles size={18} />
            Generate Insights
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6">
          <div className="flex items-center gap-3 text-gray-200">
            <Spinner />
            <span className="text-sm">Analyzing your spending patterns...</span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-700/60" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-700/60" />
            <div className="h-4 w-3/6 animate-pulse rounded bg-gray-700/60" />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6">
          <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-400">
            {error}
          </div>
          <button
            type="button"
            onClick={generate}
            className="mt-3 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-200 hover:border-red-500/60 hover:text-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {generated && !loading && !error ? (
        <div className="mt-6 space-y-3">
          {(bullets.length ? bullets : [String(insights || "")])
            .filter(Boolean)
            .map((b, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-gray-700/50 p-4 text-sm text-gray-100 border-l-4 border-blue-500"
              >
                {b}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  )
}

