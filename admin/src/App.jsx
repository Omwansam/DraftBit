import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Messages from './pages/Messages'
import Projects from './pages/Projects'
import ProjectEditor from './pages/ProjectEditor'
import Insights from './pages/Insights'
import InsightEditor from './pages/InsightEditor'
import Careers from './pages/Careers'
import CareerEditor from './pages/CareerEditor'
import Team from './pages/Team'
import Testimonials from './pages/Testimonials'
import Services from './pages/Services'
import Clients from './pages/Clients'
import Users from './pages/Users'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="messages" element={<Messages />} />

                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:id" element={<ProjectEditor />} />

                  <Route path="insights" element={<Insights />} />
                  <Route path="insights/:id" element={<InsightEditor />} />

                  <Route path="careers" element={<Careers />} />
                  <Route path="careers/:id" element={<CareerEditor />} />

                  <Route path="team" element={<Team />} />
                  <Route path="testimonials" element={<Testimonials />} />
                  <Route path="services" element={<Services />} />
                  <Route path="clients" element={<Clients />} />

                  <Route
                    path="users"
                    element={
                      <ProtectedRoute permission="manage_users">
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute permission="manage_settings">
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="404" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
