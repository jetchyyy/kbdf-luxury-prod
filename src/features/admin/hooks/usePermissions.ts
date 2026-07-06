import { useAdminAuth } from '../context/AdminAuthContext';
import type { PermissionModule } from '../../../lib/supabase/database.types';

/**
 * Hook to check CRUD permissions for a module.
 * Returns an object with can.create, can.read, can.edit, can.delete
 */
export function usePermissions(module: PermissionModule) {
  const { can, hasAccess, isSuperadmin } = useAdminAuth();
  return {
    canCreate: can(module, 'create'),
    canRead: can(module, 'read'),
    canEdit: can(module, 'edit'),
    canDelete: can(module, 'delete'),
    hasAccess: hasAccess(module),
    isSuperadmin,
  };
}
