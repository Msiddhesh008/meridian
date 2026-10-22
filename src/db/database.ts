import Dexie, { type EntityTable } from 'dexie'
import type {
  Assignment,
  AttendanceEvent,
  DailyNote,
  Member,
  Project,
  WorkSession,
} from '../types'

export type MetaRecord = {
  key: string
  value: string
}

export class MeridianDB extends Dexie {
  members!: EntityTable<Member, 'id'>
  projects!: EntityTable<Project, 'id'>
  assignments!: EntityTable<Assignment, 'id'>
  attendance!: EntityTable<AttendanceEvent, 'id'>
  sessions!: EntityTable<WorkSession, 'id'>
  notes!: EntityTable<DailyNote, 'date'>
  meta!: EntityTable<MetaRecord, 'key'>

  constructor() {
    super('meridian_local')
    this.version(1).stores({
      members: 'id, status, role',
      projects: 'id, status, deadline',
      assignments: 'id, memberId, projectId',
      attendance: 'id, at, kind',
      sessions: 'id, startedAt, projectId, endedAt',
      notes: 'date',
      meta: 'key',
    })
  }
}

export const db = new MeridianDB()
