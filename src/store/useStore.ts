import { create } from 'zustand'
import { bootstrapLocalDb, loadAllFromDb } from '../db/bootstrap'
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

interface StoreState {
  ready: boolean
  error: string | null
  members: Member[]
  projects: Project[]
  assignments: Assignment[]
  attendance: AttendanceEvent[]
  sessions: WorkSession[]
  notes: DailyNote[]
  activeSessionId: string | null

  init: () => Promise<void>
  refresh: () => Promise<void>
  punch: (kind: AttendanceKind) => Promise<void>
  startSession: (label: string, projectId: string | null) => Promise<void>
  stopSession: () => Promise<void>
  setMemberStatus: (id: string, status: MemberStatus) => Promise<void>
  addAssignment: (data: Omit<Assignment, 'id'>) => Promise<void>
  removeAssignment: (id: string) => Promise<void>
  updateAssignmentHours: (id: string, hours: number) => Promise<void>
  setNote: (text: string) => Promise<void>
  addProject: (data: Omit<Project, 'id'>) => Promise<void>
}

async function setActiveSessionId(id: string | null) {
  await db.meta.put({ key: 'activeSessionId', value: id ?? '' })
}

export const useStore = create<StoreState>((set, get) => ({
  ready: false,
  error: null,
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

  punch: async (kind) => {
    const event: AttendanceEvent = {
      id: uid('att'),
      kind,
      at: new Date().toISOString(),
    }
    await db.attendance.add(event)
    set({ attendance: [...get().attendance, event] })
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

  setMemberStatus: async (id, status) => {
    await db.members.update(id, { status })
    set({
      members: get().members.map((m) => (m.id === id ? { ...m, status } : m)),
    })
  },

  addAssignment: async (data) => {
    const assignment: Assignment = { ...data, id: uid('asg') }
    await db.assignments.add(assignment)
    set({ assignments: [...get().assignments, assignment] })
  },

  removeAssignment: async (id) => {
    await db.assignments.delete(id)
    set({ assignments: get().assignments.filter((a) => a.id !== id) })
  },

  updateAssignmentHours: async (id, hours) => {
    await db.assignments.update(id, { hoursPerWeek: hours })
    set({
      assignments: get().assignments.map((a) =>
        a.id === id ? { ...a, hoursPerWeek: hours } : a,
      ),
    })
  },

  setNote: async (text) => {
    const date = todayKey()
    const note: DailyNote = { date, text }
    await db.notes.put(note)
    const notes = get().notes.filter((n) => n.date !== date)
    set({ notes: [...notes, note] })
  },

  addProject: async (data) => {
    const project: Project = { ...data, id: uid('prj') }
    await db.projects.add(project)
    set({ projects: [...get().projects, project] })
  },
}))

export function allocatedHours(memberId: string, assignments: Assignment[]) {
  return assignments
    .filter((a) => a.memberId === memberId)
    .reduce((sum, a) => sum + a.hoursPerWeek, 0)
}
