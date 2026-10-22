import type { Assignment, Member, Project } from '../types'

export const seedMembers: Member[] = [
  { id: 'm1', name: 'Aisha Rahman', role: 'Frontend', capacityHours: 40, status: 'available', initials: 'AR' },
  { id: 'm2', name: 'Ben Okonkwo', role: 'Backend', capacityHours: 40, status: 'busy', initials: 'BO' },
  { id: 'm3', name: 'Chloe Nguyen', role: 'Design', capacityHours: 32, status: 'wfh', initials: 'CN' },
  { id: 'm4', name: 'Diego Santos', role: 'Mobile', capacityHours: 40, status: 'available', initials: 'DS' },
  { id: 'm5', name: 'Elena Petrova', role: 'QA', capacityHours: 40, status: 'busy', initials: 'EP' },
  { id: 'm6', name: 'Farid Hassan', role: 'Backend', capacityHours: 40, status: 'available', initials: 'FH' },
  { id: 'm7', name: 'Grace Kim', role: 'Frontend', capacityHours: 40, status: 'leave', initials: 'GK' },
  { id: 'm8', name: 'Hiro Tanaka', role: 'DevOps', capacityHours: 40, status: 'busy', initials: 'HT' },
  { id: 'm9', name: 'Ivy Chen', role: 'Product', capacityHours: 36, status: 'available', initials: 'IC' },
  { id: 'm10', name: 'Jamal Wright', role: 'Data', capacityHours: 40, status: 'wfh', initials: 'JW' },
  { id: 'm11', name: 'Lara Silva', role: 'Frontend', capacityHours: 40, status: 'available', initials: 'LS' },
  { id: 'm12', name: 'Marcus Lee', role: 'Backend', capacityHours: 40, status: 'busy', initials: 'ML' },
]

export const seedProjects: Project[] = [
  { id: 'p1', name: 'Atlas Checkout', client: 'Northwind', status: 'active', deadline: '2026-11-15', priority: 1 },
  { id: 'p2', name: 'Pulse Mobile v2', client: 'Internal', status: 'active', deadline: '2026-12-01', priority: 1 },
  { id: 'p3', name: 'Ledger API', client: 'Helix Bank', status: 'active', deadline: '2026-10-30', priority: 2 },
  { id: 'p4', name: 'Design System', client: 'Internal', status: 'paused', deadline: '2026-12-20', priority: 3 },
  { id: 'p5', name: 'Ops Dashboard', client: 'Meridian Co', status: 'active', deadline: '2026-11-08', priority: 2 },
]

export const seedAssignments: Assignment[] = [
  { id: 'a1', memberId: 'm1', projectId: 'p1', hoursPerWeek: 20, role: 'Lead FE' },
  { id: 'a2', memberId: 'm1', projectId: 'p5', hoursPerWeek: 16, role: 'FE' },
  { id: 'a3', memberId: 'm2', projectId: 'p3', hoursPerWeek: 32, role: 'Lead BE' },
  { id: 'a4', memberId: 'm3', projectId: 'p2', hoursPerWeek: 24, role: 'UI' },
  { id: 'a5', memberId: 'm3', projectId: 'p4', hoursPerWeek: 8, role: 'System' },
  { id: 'a6', memberId: 'm4', projectId: 'p2', hoursPerWeek: 32, role: 'iOS' },
  { id: 'a7', memberId: 'm5', projectId: 'p1', hoursPerWeek: 20, role: 'QA' },
  { id: 'a8', memberId: 'm5', projectId: 'p3', hoursPerWeek: 16, role: 'QA' },
  { id: 'a9', memberId: 'm6', projectId: 'p5', hoursPerWeek: 28, role: 'BE' },
  { id: 'a10', memberId: 'm8', projectId: 'p3', hoursPerWeek: 20, role: 'Infra' },
  { id: 'a11', memberId: 'm8', projectId: 'p5', hoursPerWeek: 16, role: 'CI' },
  { id: 'a12', memberId: 'm9', projectId: 'p1', hoursPerWeek: 24, role: 'PM' },
  { id: 'a13', memberId: 'm10', projectId: 'p5', hoursPerWeek: 30, role: 'Analytics' },
  { id: 'a14', memberId: 'm11', projectId: 'p2', hoursPerWeek: 28, role: 'FE' },
  { id: 'a15', memberId: 'm12', projectId: 'p1', hoursPerWeek: 24, role: 'BE' },
  { id: 'a16', memberId: 'm12', projectId: 'p3', hoursPerWeek: 12, role: 'BE' },
]
