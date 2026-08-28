import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * Gate for everything behind sign-in.
 *
 * `permission` additionally restricts a route to roles that hold it — the
 * matching backend endpoint must enforce the same rule; hiding a route is UX,
 * not access control.
 */
export default function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, status, can } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (permission && !can(permission)) {
    return <Navigate to="/" replace />
  }

  return children
}
