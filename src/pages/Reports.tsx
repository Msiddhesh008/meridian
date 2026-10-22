import { useMemo } from 'react'
import { format, parseISO, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { SoftBarChart } from '../components/Charts'
import { PageEnter } from '../components/PageEnter'
import { Button, Empty, PageHeader, Panel, PanelTitle, Stat, StatusPill } from '../components/ui'
import {
  formatDuration,
  sessionMinutes,
  workMinutesForDay,
  workMinutesForWeek,
} from '../lib/time'
import { allocatedHours, useStore } from '../store/useStore'

export function Reports() {
  const sessions = useStore((s) => s.sessions)
  const projects = useStore((s) => s.projects)
  const members = useStore((s) => s.members)
  const assignments = useStore((s) => s.assignments)

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: now })

  const todayMins = workMinutesForDay(sessions, now)
  const weekMins = workMinutesForWeek(sessions, now)

  const byProject = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sessions) {
      const key = s.projectId ?? 'none'
      map.set(key, (map.get(key) ?? 0) + sessionMinutes(s))
    }
    return [...map.entries()]
      .map(([id, mins]) => ({
        id,
        name: id === 'none' ? 'Unassigned' : projects.find((p) => p.id === id)?.name ?? 'Unknown',
        mins,
      }))
      .sort((a, b) => b.mins - a.mins)
  }, [sessions, projects])

  const capacityRows = useMemo(
    () =>
      members
        .map((m) => {
          const used = allocatedHours(m.id, assignments)
          return {
            ...m,
            used,
            over: used > m.capacityHours,
            pct: Math.round((used / m.capacityHours) * 100),
          }
        })
        .sort((a, b) => b.pct - a.pct),
    [members, assignments],
  )

  function exportCsv() {
    const rows = [
      ['Label', 'Project', 'Started', 'Ended', 'Minutes'],
      ...sessions.map((s) => [
        s.label,
        s.projectId ? projects.find((p) => p.id === s.projectId)?.name ?? '' : '',
        s.startedAt,
        s.endedAt ?? '',
        String(sessionMinutes(s)),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meridian-sessions-${format(now, 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageEnter className="pt-3">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        action={
          <Button variant="secondary" onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Panel>
          <Stat label="Today" value={formatDuration(todayMins)} />
        </Panel>
        <Panel>
          <Stat label="Week to date" value={formatDuration(weekMins)} />
        </Panel>
        <Panel>
          <Stat
            label="Overloaded"
            value={`${capacityRows.filter((r) => r.over).length}`}
            hint="Members over capacity"
          />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelTitle>This week</PanelTitle>
          <SoftBarChart
            items={days.map((day) => ({
              label: format(day, 'EEE').slice(0, 2),
              minutes: workMinutesForDay(sessions, day),
            }))}
          />
        </Panel>

        <Panel>
          <PanelTitle>Hours by project</PanelTitle>
          {byProject.length === 0 ? (
            <Empty>No tracked sessions yet</Empty>
          ) : (
            <ul className="space-y-3">
              {byProject.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink">{row.name}</span>
                  <span className="tabular-nums text-muted">{formatDuration(row.mins)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelTitle>Team capacity</PanelTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-muted">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Allocated</th>
                  <th className="pb-3 font-medium">Capacity</th>
                  <th className="pb-3 font-medium">Load</th>
                </tr>
              </thead>
              <tbody>
                {capacityRows.map((m) => (
                  <tr key={m.id} className="border-b border-line-soft last:border-0">
                    <td className="py-3 font-medium text-ink">{m.name}</td>
                    <td className="py-3 text-muted">{m.role}</td>
                    <td className="py-3 tabular-nums">{m.used}h</td>
                    <td className="py-3 tabular-nums text-muted">{m.capacityHours}h</td>
                    <td className="py-3">
                      <StatusPill tone={m.over ? 'warn' : m.pct > 85 ? 'warn' : 'good'}>
                        {m.pct}%
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelTitle>Recent sessions</PanelTitle>
          {sessions.length === 0 ? (
            <Empty>Sessions will appear here as you track time</Empty>
          ) : (
            <ul className="divide-y divide-line-soft">
              {[...sessions]
                .reverse()
                .slice(0, 12)
                .map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{s.label}</p>
                      <p className="text-xs text-muted">
                        {format(parseISO(s.startedAt), 'EEE d MMM · HH:mm')}
                        {s.endedAt ? ` – ${format(parseISO(s.endedAt), 'HH:mm')}` : ' · live'}
                        {isSameDay(parseISO(s.startedAt), now) ? ' · today' : ''}
                      </p>
                    </div>
                    <span className="tabular-nums text-muted">{formatDuration(sessionMinutes(s))}</span>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageEnter>
  )
}
