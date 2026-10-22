import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Pause,
  Play,
  LogIn,
  LogOut,
  Clock3,
  Users,
  FolderKanban,
  CalendarDays,
  Sparkles,
} from 'lucide-react'
import { eachDayOfInterval, format, startOfWeek } from 'date-fns'
import {
  Avatar,
  Button,
  Empty,
  Field,
  MetricCard,
  Panel,
  PanelTitle,
  Select,
  StatusPill,
  TextArea,
} from '../components/ui'
import { SoftBarChart, SoftDonut } from '../components/Charts'
import { UserAvatar } from '../components/UserAvatar'
import { profile } from '../config/profile'
import {
  clockInTime,
  derivePresence,
  formatClock,
  formatDuration,
  todayKey,
  workMinutesForDay,
  workMinutesForWeek,
  sessionMinutes,
} from '../lib/time'
import { allocatedHours, useStore } from '../store/useStore'

export function Dashboard() {
  const members = useStore((s) => s.members)
  const projects = useStore((s) => s.projects)
  const assignments = useStore((s) => s.assignments)
  const attendance = useStore((s) => s.attendance)
  const sessions = useStore((s) => s.sessions)
  const notes = useStore((s) => s.notes)
  const activeSessionId = useStore((s) => s.activeSessionId)
  const punch = useStore((s) => s.punch)
  const startSession = useStore((s) => s.startSession)
  const stopSession = useStore((s) => s.stopSession)
  const setNote = useStore((s) => s.setNote)

  const [label, setLabel] = useState('')
  const [projectId, setProjectId] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [, tick] = useState(0)

  const presence = derivePresence(attendance)
  const active = sessions.find((s) => s.id === activeSessionId)
  const todayNote = notes.find((n) => n.date === todayKey())
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    setNoteDraft(todayNote?.text ?? '')
  }, [todayNote?.text])

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const todayMins = workMinutesForDay(sessions)
  const weekMins = workMinutesForWeek(sessions)
  const inAt = clockInTime(attendance)
  const available = members.filter((m) => m.status === 'available')
  const activeProjects = projects.filter((p) => p.status === 'active')
  const overloaded = useMemo(
    () => members.filter((m) => allocatedHours(m.id, assignments) > m.capacityHours),
    [members, assignments],
  )

  const weekBars = useMemo(() => {
    const now = new Date()
    const start = startOfWeek(now, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: now }).map((day) => ({
      label: format(day, 'EEE').slice(0, 2),
      minutes: workMinutesForDay(sessions, day),
    }))
  }, [sessions])

  const donutSlices = useMemo(() => {
    const colors = ['#4a9d9c', '#5b8fd9', '#8b7ec8', '#5aa88a', '#d4896c', '#6a8fbf']
    return activeProjects.slice(0, 5).map((p, i) => ({
      label: p.name,
      value:
        assignments
          .filter((a) => a.projectId === p.id)
          .reduce((sum, a) => sum + a.hoursPerWeek, 0) || 1,
      color: colors[i % colors.length],
    }))
  }, [activeProjects, assignments])

  const recentSessions = [...sessions].reverse().slice(0, 4)

  return (
    <div className="space-y-5 pt-3">
      {/* Hero banner — like reference */}
      <section
        className="relative overflow-hidden rounded-[1.75rem] px-6 py-6 sm:px-8 sm:py-7"
        style={{
          background: 'linear-gradient(135deg, #2a3a55 0%, #1b2740 48%, #243352 100%)',
          boxShadow:
            '14px 18px 36px rgba(40, 55, 90, 0.28), -4px -4px 12px rgba(255,255,255,0.35)',
        }}
      >
        <div className="pointer-events-none absolute -right-6 -top-10 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-40 rounded-full bg-lavender/25 blur-3xl" />

        <div className="relative grid items-center gap-6 lg:grid-cols-[1.2fr_auto]">
          <div>
            <p className="text-sm font-medium text-white/55">
              {greeting}, {profile.shortName}!
            </p>
            <h2 className="mt-1 max-w-lg font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Time to lead your next block
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/50">
              {presence === 'in'
                ? `You're in${inAt ? ` since ${formatClock(inAt)}` : ''}. Keep allocation balanced and track focus.`
                : 'Clock in to start attendance, then launch a focus session.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {presence === 'out' ? (
                <Button variant="soft" onClick={() => void punch('in')}>
                  <LogIn size={16} /> Clock in
                </Button>
              ) : presence === 'break' ? (
                <Button variant="soft" onClick={() => void punch('break_end')}>
                  Resume work
                </Button>
              ) : (
                <>
                  <Button
                    className="!bg-white/15 !text-white !shadow-none hover:!bg-white/25"
                    onClick={() => void punch('break_start')}
                  >
                    <Pause size={16} /> Break
                  </Button>
                  <Button
                    className="!bg-white/15 !text-white !shadow-none hover:!bg-white/25"
                    onClick={() => void punch('out')}
                  >
                    <LogOut size={16} /> Clock out
                  </Button>
                </>
              )}
              {!active ? (
                <Button
                  variant="soft"
                  onClick={() => void startSession('Focus block', null)}
                >
                  <Play size={16} /> Start focus
                </Button>
              ) : (
                <Button variant="soft" onClick={() => void stopSession()}>
                  <Pause size={16} /> Stop · {formatDuration(sessionMinutes(active))}
                </Button>
              )}
            </div>
          </div>

          <div className="relative mx-auto flex items-end justify-center lg:mx-0">
            <div className="relative">
              <UserAvatar size={250} float />
              <button
                type="button"
                className="absolute bottom-3 right-2 flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink"
                style={{ boxShadow: '8px 10px 20px rgba(0,0,0,0.25)' }}
                aria-label={active ? 'Stop session' : 'Start session'}
                onClick={() =>
                  active ? void stopSession() : void startSession('Focus block', null)
                }
              >
                {active ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" className="ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          tone="mint"
          icon={<Clock3 size={18} />}
          label="Worked today"
          value={formatDuration(todayMins)}
          hint={inAt ? `In · ${formatClock(inAt)}` : 'Not clocked in'}
        />
        <MetricCard
          tone="sky"
          icon={<CalendarDays size={18} />}
          label="This week"
          value={formatDuration(weekMins)}
          hint="Mon–today"
        />
        <MetricCard
          tone="lavender"
          icon={<Users size={18} />}
          label="Team free"
          value={`${available.length}`}
          hint={`${overloaded.length} overloaded`}
        />
        <MetricCard
          tone="peach"
          icon={<FolderKanban size={18} />}
          label="Active projects"
          value={`${activeProjects.length}`}
          hint={`${assignments.length} allocations`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Panel className="xl:col-span-3">
          <PanelTitle>Week overview</PanelTitle>
          <SoftBarChart items={weekBars} />
        </Panel>
        <Panel className="xl:col-span-2">
          <PanelTitle
            aside={
              <Link to="/projects" className="text-xs font-semibold text-muted hover:text-ink">
                Details
              </Link>
            }
          >
            Allocation mix
          </PanelTitle>
          {donutSlices.length === 0 ? (
            <Empty>Add project allocations</Empty>
          ) : (
            <SoftDonut
              slices={donutSlices}
              centerLabel="Load"
              centerValue={`${donutSlices.reduce((s, x) => s + x.value, 0)}h`}
            />
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-5" id="focus-start">
        <Panel className="lg:col-span-3">
          <PanelTitle
            aside={
              <Link to="/attendance" className="text-xs font-semibold text-muted hover:text-ink">
                Time desk
              </Link>
            }
          >
            Focus timer
          </PanelTitle>

          {active ? (
            <div className="neu-well mb-5 px-5 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <StatusPill tone="good">Running</StatusPill>
                  <p className="mt-2 font-display text-xl font-semibold text-ink">{active.label}</p>
                  <p className="mt-1 text-sm text-muted">
                    {active.projectId
                      ? projects.find((p) => p.id === active.projectId)?.name
                      : 'No project'}{' '}
                    · {formatClock(active.startedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-bold text-ink">
                    {formatDuration(sessionMinutes(active))}
                  </p>
                  <Button className="mt-3" variant="secondary" onClick={() => void stopSession()}>
                    Stop
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
              <Field label="What are you working on?">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Sprint prep, 1:1, deep work…"
                  className="w-full rounded-2xl border-0 bg-canvas-deep/70 px-3.5 py-2.5 text-sm outline-none shadow-[inset_4px_4px_10px_rgba(163,177,198,0.28),inset_-3px_-3px_8px_rgba(255,255,255,0.75)] focus:ring-2 focus:ring-accent/25"
                />
              </Field>
              <Field label="Project">
                <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Button
                  variant="soft"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    void startSession(label, projectId || null)
                    setLabel('')
                  }}
                >
                  <Play size={16} /> Start
                </Button>
              </div>
            </div>
          )}

          <PanelTitle>Daily note</PanelTitle>
          <TextArea
            rows={3}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={() => void setNote(noteDraft)}
            placeholder="Decisions, blockers, follow-ups…"
          />
        </Panel>

        <div className="space-y-5 lg:col-span-2">
          <Panel>
            <PanelTitle
              aside={
                <Link
                  to="/team"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink"
                >
                  Team <ArrowUpRight size={12} />
                </Link>
              }
            >
              Who&apos;s free
            </PanelTitle>
            {available.length === 0 ? (
              <Empty>No one marked available</Empty>
            ) : (
              <ul className="space-y-2.5">
                {available.slice(0, 4).map((m) => {
                  const hours = allocatedHours(m.id, assignments)
                  return (
                    <li
                      key={m.id}
                      className="neu-well flex items-center gap-3 !rounded-2xl px-3 py-2.5"
                    >
                      <Avatar initials={m.initials} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                        <p className="text-xs text-muted">
                          {m.role} · {hours}/{m.capacityHours}h
                        </p>
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[4px_4px_10px_rgba(74,157,156,0.35)]"
                        aria-label="Open"
                      >
                        <Play size={13} fill="currentColor" className="ml-0.5" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          {/* Daily mix style card */}
          <div
            className="relative overflow-hidden rounded-[1.5rem] p-5 text-white"
            style={{
              background:
                'linear-gradient(160deg, rgba(30,45,70,0.92), rgba(74,157,156,0.85)), linear-gradient(135deg,#5b8fd9,#8b7ec8)',
              boxShadow: '10px 14px 28px rgba(80,100,140,0.28)',
              minHeight: 180,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Today&apos;s mix
            </p>
            <p className="mt-2 font-display text-xl font-bold">Lead desk pulse</p>
            <p className="mt-1 text-sm text-white/65">
              {available.length} free · {activeProjects.length} projects ·{' '}
              {formatDuration(todayMins)} tracked
            </p>
            <Link to="/reports">
              <Button variant="secondary" size="sm" className="mt-5 !rounded-full">
                <Play size={14} fill="currentColor" className="ml-0.5" /> Open reports
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent sessions — recently played style */}
      <Panel>
        <PanelTitle>Recent sessions</PanelTitle>
        {recentSessions.length === 0 ? (
          <Empty>Start a session to fill this list</Empty>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {recentSessions.map((s) => (
              <li
                key={s.id}
                className="neu-well flex items-center gap-3 !rounded-2xl px-3 py-2.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft to-sky-soft text-accent-deep">
                  <Clock3 size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{s.label}</p>
                  <p className="text-xs text-muted">{formatDuration(sessionMinutes(s))}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-[4px_4px_10px_rgba(74,157,156,0.3)]">
                  <Play size={13} fill="currentColor" className="ml-0.5" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Footer strip like reference */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] px-5 py-4 text-white"
        style={{
          background: 'linear-gradient(90deg, #1b2740, #243352)',
          boxShadow: '8px 12px 24px rgba(40,55,90,0.22)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Sparkles size={18} className="text-[#e8d5a3]" />
          </span>
          <div>
            <p className="text-sm font-semibold">Balance your week</p>
            <p className="text-xs text-white/50">Check overload and reallocate in one place</p>
          </div>
        </div>
        <Link to="/team">
          <Button variant="soft" size="sm" className="!rounded-full">
            Review team
          </Button>
        </Link>
      </div>
    </div>
  )
}
