import { useAdminAuth } from '../context/AdminAuthContext';
import type { PermissionModule, PermissionAction } from '../../../lib/supabase/database.types';

interface PermissionGateProps {
  module: PermissionModule;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if the current user has the required permission.
 * Use for hiding buttons, action columns, etc.
 */
export function PermissionGate({ module, action, children, fallback = null }: PermissionGateProps) {
  const { can, isSuperadmin } = useAdminAuth();
  if (isSuperadmin || can(module, action)) return <>{children}</>;
  return <>{fallback}</>;
}
