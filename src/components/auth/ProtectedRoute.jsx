import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppLoader from '../ui/AppLoader'

export default function ProtectedRoute({ children }) {
  const { user, loading, configured } = useAuth()

  if (loading) return <AppLoader />
  if (!configured) return <Navigate to="/login" replace />
  if (!user) return <Navigate to="/login" replace />

  return children
}