import { useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Field,
  Input,
  PageHeader,
  Panel,
  Select,
  StatusPill,
} from '../components/ui'
import { allocatedHours, useStore } from '../store/useStore'
import type { MemberStatus } from '../types'

const statusTone: Record<MemberStatus, 'good' | 'warn' | 'danger' | 'neutral'> = {
  available: 'good',
  busy: 'neutral',
  wfh: 'warn',
  leave: 'danger',
}

export function Team() {
  const members = useStore((s) => s.members)
  const projects = useStore((s) => s.projects)
  const assignments = useStore((s) => s.assignments)
  const setMemberStatus = useStore((s) => s.setMemberStatus)
  const addAssignment = useStore((s) => s.addAssignment)
  const removeAssignment = useStore((s) => s.removeAssignment)

  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [hours, setHours] = useState('16')
  const [role, setRole] = useState('')
  const [filter, setFilter] = useState<'all' | MemberStatus>('all')

  const visible = useMemo(
    () => members.filter((m) => (filter === 'all' ? true : m.status === filter)),
    [members, filter],
  )

  return (
    <div className="pt-3">
      <PageHeader
        eyebrow="People"
        title="Team"
        action={
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'available', 'busy', 'wfh', 'leave'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  filter === f ? 'bg-ink text-canvas' : 'bg-surface text-muted hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((m) => {
          const hoursUsed = allocatedHours(m.id, assignments)
          const over = hoursUsed > m.capacityHours
          const memberAssignments = assignments.filter((a) => a.memberId === m.id)

          return (
            <Panel key={m.id} className="!p-4">
              <div className="flex items-start gap-3">
                <Avatar initials={m.initials} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                      <p className="text-xs text-muted">{m.role}</p>
                    </div>
                    <StatusPill tone={statusTone[m.status]}>{m.status}</StatusPill>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-muted">
                      <span>Allocation</span>
                      <span className={over ? 'text-warn' : ''}>
                        {hoursUsed}/{m.capacityHours}h
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                      <div
                        className={`h-full rounded-full ${over ? 'bg-warn' : 'bg-accent'}`}
                        style={{
                          width: `${Math.min(100, (hoursUsed / m.capacityHours) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <Select
                      value={m.status}
                      onChange={(e) => setMemberStatus(m.id, e.target.value as MemberStatus)}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="wfh">WFH</option>
                      <option value="leave">Leave</option>
                    </Select>
                  </div>

                  {memberAssignments.length > 0 ? (
                    <ul className="mt-3 space-y-1.5 border-t border-line-soft pt-3">
                      {memberAssignments.map((a) => {
                        const project = projects.find((p) => p.id === a.projectId)
                        return (
                          <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate text-muted">
                              {project?.name ?? 'Project'} · {a.hoursPerWeek}h · {a.role}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAssignment(a.id)}
                              className="shrink-0 text-faint hover:text-danger"
                            >
                              Remove
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 border-t border-line-soft pt-3 text-xs text-faint">
                      No assignments
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          )
        })}
      </div>

      <Panel>
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Allocate member</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Member">
            <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Project">
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Hours / week">
            <Input
              type="number"
              min={1}
              max={40}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </Field>
          <Field label="Role on project">
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Lead FE" />
          </Field>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => {
                if (!memberId || !projectId) return
                addAssignment({
                  memberId,
                  projectId,
                  hoursPerWeek: Number(hours) || 8,
                  role: role.trim() || 'Contributor',
                })
                setRole('')
              }}
            >
              Assign
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
