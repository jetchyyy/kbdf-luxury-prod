import { useAdminAuth } from '../context/AdminAuthContext';

export function useAdminUser() {
  const { adminUser, tenant, role, isSuperadmin, isLoading } = useAdminAuth();
  return { adminUser, tenant, role, isSuperadmin, isLoading };
}
