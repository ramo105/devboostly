import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />
  }

  // Rediriger si admin requis mais pas admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute