import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DbBoot } from './components/DbBoot'
import { Layout } from './components/Layout'
import { Attendance } from './pages/Attendance'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { Team } from './pages/Team'

export default function App() {
  return (
    <DbBoot>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="team" element={<Team />} />
            <Route path="projects" element={<Projects />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DbBoot>
  )
}
