import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Clock3,
  FolderKanban,
  LayoutDashboard,
  Users,
  BarChart3,
  Sparkles,
  Search,
  Bell,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useStore } from '../store/useStore'
import { derivePresence, formatDuration, sessionMinutes } from '../lib/time'
import { Button } from './ui'
import { UserAvatar } from './UserAvatar'
import { profile } from '../config/profile'

const links = [
  { to: '/', label: 'Today', icon: LayoutDashboard, end: true },
  { to: '/attendance', label: 'Time', icon: Clock3 },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/attendance': 'Time',
  '/team': 'Team',
  '/projects': 'Projects',
  '/reports': 'Reports',
}

export function Layout() {
  const location = useLocation()
  const attendance = useStore((s) => s.attendance)
  const sessions = useStore((s) => s.sessions)
  const activeSessionId = useStore((s) => s.activeSessionId)
  const presence = derivePresence(attendance)
  const active = sessions.find((s) => s.id === activeSessionId)
  const [, tick] = useState(0)
  const pageTitle = titles[location.pathname] ?? 'Meridian'

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => tick((n) => n + 1), 30_000)
    return () => window.clearInterval(id)
  }, [active])

  return (
    <div className="flex h-dvh gap-4 overflow-hidden px-3 pt-3 pb-0 sm:px-4 sm:pt-4 lg:gap-5 lg:px-5 lg:pt-5">
      {/* Sidebar only — bottom gap; layout itself has no bottom padding */}
      <aside
        className="relative mb-3 hidden h-[calc(100%-0.75rem)] w-[240px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#1e2d4a] via-[#1b2740] to-[#152033] p-5 text-white lg:sticky lg:top-0 lg:flex"
        style={{ boxShadow: 'var(--shadow-sidebar)' }}
      >
        <div className="pointer-events-none absolute -right-8 top-16 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-lavender/20 blur-3xl" />

        <div className="relative mb-7 flex flex-col items-center text-center">
          <UserAvatar size={96} float className="mb-3" />
          <p className="font-display text-lg font-semibold tracking-tight">
            Hi, {profile.shortName}!
          </p>
          <p className="mt-0.5 text-xs text-white/45">{format(new Date(), 'EEEE, d MMM')}</p>
          <span
            className={`mt-3 rounded-full px-3 py-1 text-[11px] font-semibold ${
              presence === 'in'
                ? 'bg-accent/30 text-[#b8f0e8]'
                : presence === 'break'
                  ? 'bg-warn/25 text-[#ffd9a0]'
                  : 'bg-white/10 text-white/55'
            }`}
          >
            {presence === 'in' ? 'Clocked in' : presence === 'break' ? 'On break' : 'Clocked out'}
          </span>
        </div>

        <nav className="relative flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-[#eef3fb] to-white text-ink shadow-[0_10px_24px_rgba(0,0,0,0.28)]'
                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.85} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="relative mt-4 overflow-hidden rounded-[1.35rem] bg-white/[0.07] p-4 backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8d5a3] to-[#c9a45c] text-ink shadow-md">
            <Sparkles size={18} />
          </div>
          <p className="font-display text-sm font-semibold text-white">Lead focus</p>
          <p className="mt-1 text-xs leading-relaxed text-white/45">
            {active
              ? `${active.label} · ${formatDuration(sessionMinutes(active))}`
              : 'Start a focus block to track deep work'}
          </p>
          <Button
            variant="soft"
            size="sm"
            className="mt-3 w-full !rounded-xl"
            onClick={() =>
              document.getElementById('focus-start')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            {active ? 'Jump to timer' : 'Start focus'}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col ">
        <header className="sticky top-0 z-20 hidden shrink-0 items-center justify-between gap-4 rounded-[1.5rem] bg-[#f4f7fc] px-4 py-3 shadow-[6px_8px_18px_rgba(148,163,184,0.22),-4px_-4px_12px_rgba(255,255,255,0.7)] lg:flex xl:px-5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <label className="neu-well flex items-center gap-2 !rounded-full px-4 py-2.5">
              <Search size={16} className="text-muted" />
              <input
                type="search"
                placeholder="Search team, projects…"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-faint xl:w-56"
              />
            </label>
            <button
              type="button"
              className="neu-btn relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-white to-surface text-ink"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>
            <UserAvatar size={44} float />
          </div>
        </header>

        <main className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-1 pt-0 pb-20 sm:px-2 lg:px-2 lg:pb-0 xl:px-4">
          <div className="mx-auto max-w-6xl">
            <div className="sticky top-0 z-20 mb-3 flex items-center justify-between gap-3 bg-[#e8eef6] py-2 lg:hidden">
              <div className="flex items-center gap-3">
                <UserAvatar size={48} float />
                <div>
                  <p className="font-display text-base font-semibold text-ink">
                    Hi, {profile.shortName}
                  </p>
                  <p className="text-xs text-muted">{pageTitle}</p>
                </div>
              </div>
              {active ? (
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-deep">
                  Live · {formatDuration(sessionMinutes(active))}
                </span>
              ) : null}
            </div>
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line/50 bg-[#eef2f8]/92 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg justify-between">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold ${
                  isActive ? 'text-ink' : 'text-faint'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.85} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
