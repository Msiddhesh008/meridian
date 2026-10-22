import { useEffect, useState } from 'react'
import { Coffee, LogIn, LogOut, Play, Square, Trash2 } from 'lucide-react'
import { PageEnter } from '../components/PageEnter'
import {
  Button,
  Empty,
  Field,
  PageHeader,
  Panel,
  PanelTitle,
  Select,
  Stat,
  StatusPill,
} from '../components/ui'
import {
  clockInTime,
  derivePresence,
  formatClock,
  formatDay,
  formatDuration,
  sessionMinutes,
  sessionsForDay,
  todayAttendance,
  workMinutesForDay,
} from '../lib/time'
import { useStore } from '../store/useStore'

export function Attendance() {
  const attendance = useStore((s) => s.attendance)
  const sessions = useStore((s) => s.sessions)
  const projects = useStore((s) => s.projects)
  const activeSessionId = useStore((s) => s.activeSessionId)
  const punch = useStore((s) => s.punch)
  const startSession = useStore((s) => s.startSession)
  const stopSession = useStore((s) => s.stopSession)
  const removeAttendance = useStore((s) => s.removeAttendance)
  const removeSession = useStore((s) => s.removeSession)

  const [label, setLabel] = useState('')
  const [projectId, setProjectId] = useState('')
  const [, tick] = useState(0)

  const presence = derivePresence(attendance)
  const active = sessions.find((s) => s.id === activeSessionId)
  const todaysEvents = todayAttendance(attendance)
  const todaysSessions = sessionsForDay(sessions)
  const inAt = clockInTime(attendance)
  const todayMins = workMinutesForDay(sessions)

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 15_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <PageEnter className="pt-3">
      <PageHeader eyebrow="Attendance" title="Time" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Panel>
          <Stat
            label="Status"
            value={presence === 'in' ? 'In' : presence === 'break' ? 'Break' : 'Out'}
            hint={inAt ? `First in ${formatClock(inAt)}` : 'No punch yet'}
          />
        </Panel>
        <Panel>
          <Stat label="Tracked today" value={formatDuration(todayMins)} />
        </Panel>
        <Panel>
          <Stat
            label="Sessions"
            value={`${todaysSessions.length}`}
            hint={active ? 'One running' : 'None running'}
          />
        </Panel>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {presence === 'out' && (
          <Button onClick={() => punch('in')}>
            <LogIn size={16} /> Clock in
          </Button>
        )}
        {presence === 'in' && (
          <>
            <Button variant="secondary" onClick={() => punch('break_start')}>
              <Coffee size={16} /> Start break
            </Button>
            <Button variant="secondary" onClick={() => punch('out')}>
              <LogOut size={16} /> Clock out
            </Button>
          </>
        )}
        {presence === 'break' && (
          <>
            <Button onClick={() => punch('break_end')}>End break</Button>
            <Button variant="secondary" onClick={() => punch('out')}>
              <LogOut size={16} /> Clock out
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Session control</PanelTitle>
          {active ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-canvas px-4 py-5">
                <StatusPill tone="good">Running</StatusPill>
                <p className="mt-3 font-display text-2xl font-semibold text-ink">{active.label}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDuration(sessionMinutes(active))} elapsed
                </p>
              </div>
              <Button onClick={stopSession}>
                <Square size={16} /> Stop session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Field label="Session label">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Code review, 1:1, deep work…"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
              </Field>
              <Field label="Link project">
                <Select
                  value={projectId}
                  onChange={setProjectId}
                  emptyLabel="Unassigned"
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </Field>
              <Button
                onClick={() => {
                  startSession(label, projectId || null)
                  setLabel('')
                }}
              >
                <Play size={16} /> Start session
              </Button>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelTitle>Punch log</PanelTitle>
          {todaysEvents.length === 0 ? (
            <Empty>No attendance events today</Empty>
          ) : (
            <ul className="space-y-0">
              {todaysEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 border-b border-line-soft py-3 text-sm last:border-0"
                >
                  <span className="capitalize text-ink">{e.kind.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-muted">{formatClock(e.at)}</span>
                    <button
                      type="button"
                      aria-label="Delete punch"
                      className="rounded-lg p-1.5 text-faint hover:bg-danger-soft hover:text-danger"
                      onClick={() => void removeAttendance(e.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelTitle>Today&apos;s sessions</PanelTitle>
          {todaysSessions.length === 0 ? (
            <Empty>Start a session to build your day</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-muted">
                    <th className="pb-3 font-medium">Label</th>
                    <th className="pb-3 font-medium">Project</th>
                    <th className="pb-3 font-medium">Start</th>
                    <th className="pb-3 font-medium">End</th>
                    <th className="pb-3 font-medium text-right">Duration</th>
                    <th className="pb-3 font-medium text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {[...todaysSessions].reverse().map((s) => (
                    <tr key={s.id} className="border-b border-line-soft last:border-0">
                      <td className="py-3 font-medium text-ink">{s.label}</td>
                      <td className="py-3 text-muted">
                        {s.projectId
                          ? projects.find((p) => p.id === s.projectId)?.name ?? '—'
                          : '—'}
                      </td>
                      <td className="py-3 tabular-nums text-muted">{formatClock(s.startedAt)}</td>
                      <td className="py-3 tabular-nums text-muted">
                        {s.endedAt ? formatClock(s.endedAt) : 'Live'}
                      </td>
                      <td className="py-3 text-right tabular-nums text-ink">
                        {formatDuration(sessionMinutes(s))}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          aria-label="Delete session"
                          className="rounded-lg p-1.5 text-faint hover:bg-danger-soft hover:text-danger"
                          onClick={() => {
                            if (window.confirm('Delete this session?')) void removeSession(s.id)
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-faint">{formatDay(new Date().toISOString())}</p>
        </Panel>
      </div>
    </PageEnter>
  )
}
