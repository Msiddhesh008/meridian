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
import { useStore } from '../store/useStore'
import type { ProjectStatus } from '../types'

export function Projects() {
  const projects = useStore((s) => s.projects)
  const members = useStore((s) => s.members)
  const assignments = useStore((s) => s.assignments)
  const addProject = useStore((s) => s.addProject)
  const addAssignment = useStore((s) => s.addAssignment)
  const removeAssignment = useStore((s) => s.removeAssignment)
  const updateAssignmentHours = useStore((s) => s.updateAssignmentHours)

  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<'1' | '2' | '3'>('2')
  const [assignProjectId, setAssignProjectId] = useState(projects[0]?.id ?? '')
  const [assignMemberId, setAssignMemberId] = useState(members[0]?.id ?? '')
  const [assignHours, setAssignHours] = useState('16')
  const [assignRole, setAssignRole] = useState('')

  const enriched = useMemo(
    () =>
      projects.map((p) => {
        const team = assignments.filter((a) => a.projectId === p.id)
        const totalHours = team.reduce((sum, a) => sum + a.hoursPerWeek, 0)
        return { ...p, team, totalHours }
      }),
    [projects, assignments],
  )

  return (
    <div className="pt-3">
      <PageHeader eyebrow="Portfolio" title="Projects" />

      <div className="mb-6 space-y-4">
        {enriched.map((p) => (
          <Panel key={p.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-ink">{p.name}</h2>
                  <StatusPill
                    tone={
                      p.status === 'active' ? 'good' : p.status === 'paused' ? 'warn' : 'neutral'
                    }
                  >
                    {p.status}
                  </StatusPill>
                  <StatusPill tone={p.priority === 1 ? 'danger' : p.priority === 2 ? 'warn' : 'neutral'}>
                    P{p.priority}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {p.client} · deadline {p.deadline} · {p.totalHours}h / week capacity
                </p>
              </div>
            </div>

            {p.team.length === 0 ? (
              <p className="mt-4 text-sm text-faint">No members allocated</p>
            ) : (
              <ul className="mt-4 divide-y divide-line-soft border-t border-line-soft">
                {p.team.map((a) => {
                  const member = members.find((m) => m.id === a.memberId)
                  if (!member) return null
                  return (
                    <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                      <Avatar initials={member.initials} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{member.name}</p>
                        <p className="text-xs text-muted">{a.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={40}
                          className="!w-20"
                          value={a.hoursPerWeek}
                          onChange={(e) =>
                            updateAssignmentHours(a.id, Number(e.target.value) || 1)
                          }
                        />
                        <span className="text-xs text-muted">h/wk</span>
                        <Button variant="ghost" size="sm" onClick={() => removeAssignment(a.id)}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">New project</h2>
          <div className="space-y-3">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
            </Field>
            <Field label="Client">
              <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client or Internal" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Deadline">
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </Field>
              <Field label="Priority">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as '1' | '2' | '3')}>
                  <option value="1">P1 — Critical</option>
                  <option value="2">P2 — High</option>
                  <option value="3">P3 — Normal</option>
                </Select>
              </Field>
            </div>
            <Button
              onClick={() => {
                if (!name.trim()) return
                addProject({
                  name: name.trim(),
                  client: client.trim() || 'Internal',
                  status: 'active' as ProjectStatus,
                  deadline: deadline || new Date().toISOString().slice(0, 10),
                  priority: Number(priority) as 1 | 2 | 3,
                })
                setName('')
                setClient('')
                setDeadline('')
              }}
            >
              Create project
            </Button>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Quick assign</h2>
          <div className="space-y-3">
            <Field label="Project">
              <Select value={assignProjectId} onChange={(e) => setAssignProjectId(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Member">
              <Select value={assignMemberId} onChange={(e) => setAssignMemberId(e.target.value)}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hours / week">
                <Input
                  type="number"
                  value={assignHours}
                  onChange={(e) => setAssignHours(e.target.value)}
                />
              </Field>
              <Field label="Role">
                <Input
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  placeholder="Contributor"
                />
              </Field>
            </div>
            <Button
              onClick={() => {
                if (!assignProjectId || !assignMemberId) return
                addAssignment({
                  projectId: assignProjectId,
                  memberId: assignMemberId,
                  hoursPerWeek: Number(assignHours) || 8,
                  role: assignRole.trim() || 'Contributor',
                })
                setAssignRole('')
              }}
            >
              Assign to project
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
