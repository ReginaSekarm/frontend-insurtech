import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Jika allowedRoles ditentukan dan role user tidak sesuai
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect ke dashboard sesuai role masing-masing
        if (user.role === 'admin') {
            return <Navigate to="/admin-dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}