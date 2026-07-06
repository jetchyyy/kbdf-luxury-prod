import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb7a90] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!adminUser.is_active) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-white">
        <p>Your account has been deactivated. Please contact your administrator.</p>
      </div>
    );
  }

  return <>{children}</>;
}
