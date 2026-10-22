import {
  differenceInMinutes,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import type { AttendanceEvent, WorkSession } from '../types'

export function formatClock(iso: string) {
  return format(parseISO(iso), 'HH:mm')
}

export function formatDay(iso: string) {
  return format(parseISO(iso), 'EEE, d MMM')
}

export function formatDuration(totalMinutes: number) {
  const safe = Math.max(0, Math.round(totalMinutes))
  const h = Math.floor(safe / 60)
  const m = safe % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

export function sessionMinutes(session: WorkSession, now = new Date()) {
  const start = parseISO(session.startedAt)
  const end = session.endedAt ? parseISO(session.endedAt) : now
  return Math.max(0, differenceInMinutes(end, start))
}

export function sessionsForDay(sessions: WorkSession[], day = new Date()) {
  return sessions.filter((s) => isSameDay(parseISO(s.startedAt), day))
}

export function workMinutesForDay(sessions: WorkSession[], day = new Date(), now = new Date()) {
  return sessionsForDay(sessions, day).reduce((sum, s) => sum + sessionMinutes(s, now), 0)
}

export function workMinutesForWeek(sessions: WorkSession[], day = new Date(), now = new Date()) {
  const weekStart = startOfWeek(day, { weekStartsOn: 1 })
  return sessions
    .filter((s) => parseISO(s.startedAt) >= weekStart)
    .reduce((sum, s) => sum + sessionMinutes(s, now), 0)
}

export function todayAttendance(events: AttendanceEvent[], day = new Date()) {
  return events
    .filter((e) => isSameDay(parseISO(e.at), day))
    .sort((a, b) => parseISO(a.at).getTime() - parseISO(b.at).getTime())
}

export function derivePresence(events: AttendanceEvent[], day = new Date()) {
  const todays = todayAttendance(events, day)
  if (todays.length === 0) return 'out' as const

  let presence: 'in' | 'out' | 'break' = 'out'
  for (const e of todays) {
    if (e.kind === 'in') presence = 'in'
    if (e.kind === 'out') presence = 'out'
    if (e.kind === 'break_start') presence = 'break'
    if (e.kind === 'break_end') presence = 'in'
  }
  return presence
}

export function clockInTime(events: AttendanceEvent[], day = new Date()) {
  const first = todayAttendance(events, day).find((e) => e.kind === 'in')
  return first?.at ?? null
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function todayKey(day = new Date()) {
  return format(startOfDay(day), 'yyyy-MM-dd')
}
