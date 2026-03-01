import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function Spinner() {
  return (
    <svg
      className="mr-2 h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
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

export default function Login() {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [tab, setTab] = useState("signin") // "signin" | "signup"
  const isSignIn = tab === "signin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    if (loading) return false
    if (!email.trim() || !password) return false
    if (!isSignIn && !name.trim()) return false
    return true
  }, [email, password, name, isSignIn, loading])

  function switchTab(next) {
    setTab(next)
    setError("")
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignIn) {
        await login(email.trim(), password)
      } else {
        await register(name.trim(), email.trim(), password)
      }
      navigate("/dashboard")
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong. Please try again."
      setError(String(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-gray-800 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                💸 ExpenseIQ
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-300">
              Track smarter. Spend wiser.
            </p>
          </div>

          <div className="mb-6 flex gap-6 border-b border-gray-700">
            <button
              type="button"
              onClick={() => switchTab("signin")}
              className={[
                "pb-3 text-sm font-semibold",
                isSignIn
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-gray-400 hover:text-gray-200",
              ].join(" ")}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab("signup")}
              className={[
                "pb-3 text-sm font-semibold",
                !isSignIn
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-gray-400 hover:text-gray-200",
              ].join(" ")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isSignIn ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Name
                </label>
                <input
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold transition",
                "hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {loading ? <Spinner /> : null}
              {isSignIn ? "Sign In" : "Create Account"}
            </button>

            {error ? (
              <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-400">
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  )
}

