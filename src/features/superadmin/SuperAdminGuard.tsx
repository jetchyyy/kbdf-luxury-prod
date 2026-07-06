import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../admin/context/AdminAuthContext';

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, isSuperadmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb7a90] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/odc/login" replace />;
  }

  if (!isSuperadmin) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-white p-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-white/60 text-sm">You do not have permission to view the EcomSaaS Platform Superadmin dashboard.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
