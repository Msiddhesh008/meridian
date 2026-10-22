import { seedAssignments, seedMembers, seedProjects } from '../data/seed'
import type {
  Assignment,
  AttendanceEvent,
  DailyNote,
  Member,
  Project,
  WorkSession,
} from '../types'
import { db } from './database'

const LEGACY_KEY = 'meridian-v1'
const SEEDED_KEY = 'seeded'

type LegacySnapshot = {
  state?: {
    members?: Member[]
    projects?: Project[]
    assignments?: Assignment[]
    attendance?: AttendanceEvent[]
    sessions?: WorkSession[]
    notes?: DailyNote[]
    activeSessionId?: string | null
  }
}

/** Ensures IndexedDB exists, seeds once, and migrates old localStorage data if present. */
export async function bootstrapLocalDb() {
  await db.open()

  const seeded = await db.meta.get(SEEDED_KEY)
  if (!seeded) {
    const legacy = readLegacyLocalStorage()
    if (legacy?.state) {
      await importSnapshot(legacy.state)
    } else {
      await db.transaction('rw', [db.members, db.projects, db.assignments, db.meta], async () => {
        await db.members.bulkPut(seedMembers)
        await db.projects.bulkPut(seedProjects)
        await db.assignments.bulkPut(seedAssignments)
        await db.meta.put({ key: 'activeSessionId', value: '' })
      })
    }
    await db.meta.put({ key: SEEDED_KEY, value: '1' })
    clearLegacyLocalStorage()
  }
}

async function importSnapshot(state: NonNullable<LegacySnapshot['state']>) {
  await db.transaction(
    'rw',
    [
      db.members,
      db.projects,
      db.assignments,
      db.attendance,
      db.sessions,
      db.notes,
      db.meta,
    ],
    async () => {
      if (state.members?.length) await db.members.bulkPut(state.members)
      else await db.members.bulkPut(seedMembers)

      if (state.projects?.length) await db.projects.bulkPut(state.projects)
      else await db.projects.bulkPut(seedProjects)

      if (state.assignments?.length) await db.assignments.bulkPut(state.assignments)
      else await db.assignments.bulkPut(seedAssignments)

      if (state.attendance?.length) await db.attendance.bulkPut(state.attendance)
      if (state.sessions?.length) await db.sessions.bulkPut(state.sessions)
      if (state.notes?.length) await db.notes.bulkPut(state.notes)

      await db.meta.put({
        key: 'activeSessionId',
        value: state.activeSessionId ?? '',
      })
    },
  )
}

function readLegacyLocalStorage(): LegacySnapshot | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LegacySnapshot
  } catch {
    return null
  }
}

function clearLegacyLocalStorage() {
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore
  }
}

export async function loadAllFromDb() {
  const [members, projects, assignments, attendance, sessions, notes, activeMeta] =
    await Promise.all([
      db.members.toArray(),
      db.projects.toArray(),
      db.assignments.toArray(),
      db.attendance.orderBy('at').toArray(),
      db.sessions.orderBy('startedAt').toArray(),
      db.notes.toArray(),
      db.meta.get('activeSessionId'),
    ])

  return {
    members,
    projects,
    assignments,
    attendance,
    sessions,
    notes,
    activeSessionId: activeMeta?.value ? activeMeta.value : null,
  }
}
