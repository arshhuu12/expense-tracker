import { useState } from "react"
import logo from "../assets/logo.png"
import { NavLink } from "react-router-dom"
import { LogOut, Menu, X } from "lucide-react"

import { useAuth } from "../context/AuthContext"

function linkClassName({ isActive }) {
  return [
    "h-16 inline-flex items-center border-b-2 px-2 text-sm font-medium transition",
    isActive
      ? "border-blue-400 text-blue-400"
      : "border-transparent text-gray-400 hover:text-white",
  ].join(" ")
}

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <nav className="w-full border-b border-gray-700 bg-gray-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src={logo} 
            alt="ExpenseIQ" 
            className="h-9 w-9 rounded-xl" 
          />
          <span className="text-xl font-bold text-white">
            Expense<span className="text-indigo-400">IQ</span>
          </span>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/dashboard" className={linkClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/expenses" className={linkClassName}>
                Expenses
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 px-2 text-sm font-medium text-gray-400 transition hover:text-red-400"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>

            <button
              type="button"
              className="inline-flex items-center rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white md:hidden"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        ) : null}
      </div>

      {isAuthenticated && open ? (
        <div className="border-t border-gray-800 bg-gray-900 md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex flex-col gap-2">
              <NavLink
                to="/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-gray-800 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white",
                  ].join(" ")
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/expenses"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-gray-800 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white",
                  ].join(" ")
                }
              >
                Expenses
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

