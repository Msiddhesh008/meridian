export type MemberStatus = 'available' | 'busy' | 'leave' | 'wfh'
export type ProjectStatus = 'active' | 'paused' | 'done'
export type AttendanceKind = 'in' | 'out' | 'break_start' | 'break_end'

export interface Member {
  id: string
  name: string
  role: string
  capacityHours: number
  status: MemberStatus
  initials: string
}

export interface Project {
  id: string
  name: string
  client: string
  status: ProjectStatus
  deadline: string
  priority: 1 | 2 | 3
}

export interface Assignment {
  id: string
  memberId: string
  projectId: string
  hoursPerWeek: number
  role: string
}

export interface AttendanceEvent {
  id: string
  kind: AttendanceKind
  at: string
}

export interface WorkSession {
  id: string
  projectId: string | null
  label: string
  startedAt: string
  endedAt: string | null
}

export interface DailyNote {
  date: string
  text: string
}
