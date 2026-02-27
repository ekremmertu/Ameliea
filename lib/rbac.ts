/**
 * Role-Based Access Control (RBAC) System
 */

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum Permission {
  // Invitation permissions
  CREATE_INVITATION = 'create_invitation',
  READ_OWN_INVITATION = 'read_own_invitation',
  UPDATE_OWN_INVITATION = 'update_own_invitation',
  DELETE_OWN_INVITATION = 'delete_own_invitation',
  
  // Admin permissions
  READ_ALL_INVITATIONS = 'read_all_invitations',
  UPDATE_ANY_INVITATION = 'update_any_invitation',
  DELETE_ANY_INVITATION = 'delete_any_invitation',
  
  // User management
  READ_USERS = 'read_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  
  // Payment management
  READ_PAYMENTS = 'read_payments',
  REFUND_PAYMENTS = 'refund_payments',
  
  // System management
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings',
}

// Role-Permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.CREATE_INVITATION,
    Permission.READ_OWN_INVITATION,
    Permission.UPDATE_OWN_INVITATION,
    Permission.DELETE_OWN_INVITATION,
  ],
  [Role.ADMIN]: [
    Permission.CREATE_INVITATION,
    Permission.READ_OWN_INVITATION,
    Permission.UPDATE_OWN_INVITATION,
    Permission.DELETE_OWN_INVITATION,
    Permission.READ_ALL_INVITATIONS,
    Permission.READ_USERS,
    Permission.READ_PAYMENTS,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.SUPER_ADMIN]: Object.values(Permission), // All permissions
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get user role from email
 * TODO: Move to database-based role system
 */
export function getUserRole(email: string | undefined): Role {
  if (!email) return Role.USER;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  
  if (superAdminEmails.includes(email)) {
    return Role.SUPER_ADMIN;
  }
  
  if (adminEmails.includes(email)) {
    return Role.ADMIN;
  }
  
  return Role.USER;
}

/**
 * Check if user has permission
 */
export function userHasPermission(
  userEmail: string | undefined,
  permission: Permission
): boolean {
  const role = getUserRole(userEmail);
  return hasPermission(role, permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user is admin
 */
export function isAdmin(userEmail: string | undefined): boolean {
  const role = getUserRole(userEmail);
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userEmail: string | undefined): boolean {
  const role = getUserRole(userEmail);
  return role === Role.SUPER_ADMIN;
}
