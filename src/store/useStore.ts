import { create } from 'zustand'
import { defaultProfile, type UserProfile } from '../config/profile'
import { bootstrapLocalDb, loadAllFromDb, saveProfileToDb } from '../db/bootstrap'
import { db } from '../db/database'
import { todayKey, uid } from '../lib/time'
import type {
  Assignment,
  AttendanceEvent,
  AttendanceKind,
  DailyNote,
  Member,
  MemberStatus,
  Project,
  WorkSession,
} from '../types'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

interface StoreState {
  ready: boolean
  error: string | null
  profile: UserProfile
  members: Member[]
  projects: Project[]
  assignments: Assignment[]
  attendance: AttendanceEvent[]
  sessions: WorkSession[]
  notes: DailyNote[]
  activeSessionId: string | null

  init: () => Promise<void>
  refresh: () => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
  resetProfileAvatar: () => Promise<void>

  punch: (kind: AttendanceKind) => Promise<void>
  removeAttendance: (id: string) => Promise<void>
  startSession: (label: string, projectId: string | null) => Promise<void>
  stopSession: () => Promise<void>
  removeSession: (id: string) => Promise<void>

  addMember: (data: Omit<Member, 'id' | 'initials'> & { initials?: string }) => Promise<void>
  updateMember: (id: string, patch: Partial<Omit<Member, 'id'>>) => Promise<void>
  removeMember: (id: string) => Promise<void>
  setMemberStatus: (id: string, status: MemberStatus) => Promise<void>

  addProject: (data: Omit<Project, 'id'>) => Promise<void>
  updateProject: (id: string, patch: Partial<Omit<Project, 'id'>>) => Promise<void>
  removeProject: (id: string) => Promise<void>

  addAssignment: (data: Omit<Assignment, 'id'>) => Promise<void>
  updateAssignment: (id: string, patch: Partial<Omit<Assignment, 'id'>>) => Promise<void>
  removeAssignment: (id: string) => Promise<void>
  updateAssignmentHours: (id: string, hours: number) => Promise<void>

  setNote: (text: string) => Promise<void>
}

async function setActiveSessionId(id: string | null) {
  await db.meta.put({ key: 'activeSessionId', value: id ?? '' })
}

export const useStore = create<StoreState>((set, get) => ({
  ready: false,
  error: null,
  profile: { ...defaultProfile },
  members: [],
  projects: [],
  assignments: [],
  attendance: [],
  sessions: [],
  notes: [],
  activeSessionId: null,

  init: async () => {
    if (get().ready) return
    try {
      await bootstrapLocalDb()
      const data = await loadAllFromDb()
      set({ ...data, ready: true, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open local database'
      set({ error: message, ready: false })
    }
  },

  refresh: async () => {
    const data = await loadAllFromDb()
    set({ ...data, ready: true, error: null })
  },

  updateProfile: async (patch) => {
    const next = { ...get().profile, ...patch }
    await saveProfileToDb(next)
    set({ profile: next })
  },

  resetProfileAvatar: async () => {
    const next = {
      ...get().profile,
      avatarSrc: defaultProfile.avatarSrc,
      avatarFallback: defaultProfile.avatarFallback,
    }
    await saveProfileToDb(next)
    set({ profile: next })
  },

  punch: async (kind) => {
    const event: AttendanceEvent = {
      id: uid('att'),
      kind,
      at: new Date().toISOString(),
    }
    await db.attendance.add(event)
    set({ attendance: [...get().attendance, event] })
  },

  removeAttendance: async (id) => {
    await db.attendance.delete(id)
    set({ attendance: get().attendance.filter((e) => e.id !== id) })
  },

  startSession: async (label, projectId) => {
    const { activeSessionId, sessions } = get()
    const endedAt = new Date().toISOString()

    const session: WorkSession = {
      id: uid('ses'),
      projectId,
      label: label.trim() || 'Focus block',
      startedAt: new Date().toISOString(),
      endedAt: null,
    }

    await db.transaction('rw', [db.sessions, db.meta], async () => {
      if (activeSessionId) {
        const current = await db.sessions.get(activeSessionId)
        if (current && !current.endedAt) {
          await db.sessions.update(activeSessionId, { endedAt })
        }
      }
      await db.sessions.add(session)
      await setActiveSessionId(session.id)
    })

    set({
      sessions: [
        ...sessions.map((s) =>
          s.id === activeSessionId && !s.endedAt ? { ...s, endedAt } : s,
        ),
        session,
      ],
      activeSessionId: session.id,
    })
  },

  stopSession: async () => {
    const { activeSessionId, sessions } = get()
    if (!activeSessionId) return

    const endedAt = new Date().toISOString()
    await db.transaction('rw', [db.sessions, db.meta], async () => {
      const current = await db.sessions.get(activeSessionId)
      if (current && !current.endedAt) {
        await db.sessions.update(activeSessionId, { endedAt })
      }
      await setActiveSessionId(null)
    })

    set({
      sessions: sessions.map((s) =>
        s.id === activeSessionId && !s.endedAt ? { ...s, endedAt } : s,
      ),
      activeSessionId: null,
    })
  },

  removeSession: async (id) => {
    const { activeSessionId } = get()
    await db.transaction('rw', [db.sessions, db.meta], async () => {
      await db.sessions.delete(id)
      if (activeSessionId === id) await setActiveSessionId(null)
    })
    set({
      sessions: get().sessions.filter((s) => s.id !== id),
      activeSessionId: activeSessionId === id ? null : activeSessionId,
    })
  },

  addMember: async (data) => {
    const member: Member = {
      id: uid('mem'),
      name: data.name.trim(),
      role: data.role.trim() || 'Contributor',
      capacityHours: data.capacityHours || 40,
      status: data.status ?? 'available',
      initials: (data.initials?.trim() || initialsFromName(data.name)).slice(0, 3),
    }
    await db.members.add(member)
    set({ members: [...get().members, member] })
  },

  updateMember: async (id, patch) => {
    const current = get().members.find((m) => m.id === id)
    if (!current) return
    const next: Member = {
      ...current,
      ...patch,
      initials:
        patch.initials?.trim() ||
        (patch.name ? initialsFromName(patch.name) : current.initials),
    }
    await db.members.put(next)
    set({ members: get().members.map((m) => (m.id === id ? next : m)) })
  },

  removeMember: async (id) => {
    await db.transaction('rw', [db.members, db.assignments], async () => {
      await db.assignments.where('memberId').equals(id).delete()
      await db.members.delete(id)
    })
    set({
      members: get().members.filter((m) => m.id !== id),
      assignments: get().assignments.filter((a) => a.memberId !== id),
    })
  },

  setMemberStatus: async (id, status) => {
    await get().updateMember(id, { status })
  },

  addProject: async (data) => {
    const project: Project = { ...data, id: uid('prj') }
    await db.projects.add(project)
    set({ projects: [...get().projects, project] })
  },

  updateProject: async (id, patch) => {
    const current = get().projects.find((p) => p.id === id)
    if (!current) return
    const next = { ...current, ...patch }
    await db.projects.put(next)
    set({ projects: get().projects.map((p) => (p.id === id ? next : p)) })
  },

  removeProject: async (id) => {
    await db.transaction('rw', [db.projects, db.assignments], async () => {
      await db.assignments.where('projectId').equals(id).delete()
      await db.projects.delete(id)
    })
    set({
      projects: get().projects.filter((p) => p.id !== id),
      assignments: get().assignments.filter((a) => a.projectId !== id),
    })
  },

  addAssignment: async (data) => {
    const assignment: Assignment = { ...data, id: uid('asg') }
    await db.assignments.add(assignment)
    set({ assignments: [...get().assignments, assignment] })
  },

  updateAssignment: async (id, patch) => {
    const current = get().assignments.find((a) => a.id === id)
    if (!current) return
    const next = { ...current, ...patch }
    await db.assignments.put(next)
    set({
      assignments: get().assignments.map((a) => (a.id === id ? next : a)),
    })
  },

  removeAssignment: async (id) => {
    await db.assignments.delete(id)
    set({ assignments: get().assignments.filter((a) => a.id !== id) })
  },

  updateAssignmentHours: async (id, hours) => {
    await get().updateAssignment(id, { hoursPerWeek: hours })
  },

  setNote: async (text) => {
    const date = todayKey()
    const note: DailyNote = { date, text }
    await db.notes.put(note)
    const notes = get().notes.filter((n) => n.date !== date)
    set({ notes: [...notes, note] })
  },
}))

export function allocatedHours(memberId: string, assignments: Assignment[]) {
  return assignments
    .filter((a) => a.memberId === memberId)
    .reduce((sum, a) => sum + a.hoursPerWeek, 0)
}
