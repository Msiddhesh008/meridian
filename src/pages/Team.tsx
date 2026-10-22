import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageEnter } from '../components/PageEnter'
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
import type { Member, MemberStatus } from '../types'

const statusTone: Record<MemberStatus, 'good' | 'warn' | 'danger' | 'neutral'> = {
  available: 'good',
  busy: 'neutral',
  wfh: 'warn',
  leave: 'danger',
}

const memberStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'wfh', label: 'WFH' },
  { value: 'leave', label: 'Leave' },
]

const emptyForm = {
  name: '',
  role: '',
  capacityHours: '40',
  status: 'available' as MemberStatus,
}

export function Team() {
  const members = useStore((s) => s.members)
  const projects = useStore((s) => s.projects)
  const assignments = useStore((s) => s.assignments)
  const setMemberStatus = useStore((s) => s.setMemberStatus)
  const addMember = useStore((s) => s.addMember)
  const updateMember = useStore((s) => s.updateMember)
  const removeMember = useStore((s) => s.removeMember)
  const addAssignment = useStore((s) => s.addAssignment)
  const removeAssignment = useStore((s) => s.removeAssignment)

  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [hours, setHours] = useState('16')
  const [role, setRole] = useState('')
  const [filter, setFilter] = useState<'all' | MemberStatus>('all')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const visible = useMemo(
    () => members.filter((m) => (filter === 'all' ? true : m.status === filter)),
    [members, filter],
  )

  const startEdit = (m: Member) => {
    setEditingId(m.id)
    setForm({
      name: m.name,
      role: m.role,
      capacityHours: String(m.capacityHours),
      status: m.status,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <PageEnter className="pt-3">
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
                    <div className="flex items-center gap-1">
                      <StatusPill tone={statusTone[m.status]}>{m.status}</StatusPill>
                      <button
                        type="button"
                        aria-label={`Edit ${m.name}`}
                        className="rounded-lg p-1.5 text-faint hover:bg-white/60 hover:text-ink"
                        onClick={() => startEdit(m)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${m.name}`}
                        className="rounded-lg p-1.5 text-faint hover:bg-danger-soft hover:text-danger"
                        onClick={() => {
                          if (window.confirm(`Remove ${m.name} and their assignments?`)) {
                            void removeMember(m.id)
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
                          width: `${Math.min(100, (hoursUsed / Math.max(1, m.capacityHours)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <Select
                      value={m.status}
                      options={memberStatusOptions}
                      onChange={(v) => setMemberStatus(m.id, v as MemberStatus)}
                      aria-label={`${m.name} status`}
                    />
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

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">
            {editingId ? 'Edit member' : 'Add member'}
          </h2>
          <div className="space-y-3">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
            </Field>
            <Field label="Role">
              <Input
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="Designer"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacity h/wk">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={form.capacityHours}
                  onChange={(e) => setForm((f) => ({ ...f, capacityHours: e.target.value }))}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  options={memberStatusOptions}
                  onChange={(v) => setForm((f) => ({ ...f, status: v as MemberStatus }))}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  if (!form.name.trim()) return
                  const payload = {
                    name: form.name.trim(),
                    role: form.role.trim() || 'Contributor',
                    capacityHours: Number(form.capacityHours) || 40,
                    status: form.status,
                  }
                  if (editingId) {
                    void updateMember(editingId, payload)
                  } else {
                    void addMember(payload)
                  }
                  resetForm()
                }}
              >
                <Plus size={16} /> {editingId ? 'Update member' : 'Add member'}
              </Button>
              {editingId ? (
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Allocate member</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Member">
              <Select
                value={memberId}
                onChange={setMemberId}
                options={members.map((m) => ({ value: m.id, label: m.name }))}
                placeholder="Choose member"
              />
            </Field>
            <Field label="Project">
              <Select
                value={projectId}
                onChange={setProjectId}
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                placeholder="Choose project"
              />
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
            <div className="sm:col-span-2">
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
    </PageEnter>
  )
}
