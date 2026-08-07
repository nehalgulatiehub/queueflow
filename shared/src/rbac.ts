export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export const PERMISSIONS = {
  'org:delete': ['OWNER'],
  'org:update': ['OWNER', 'ADMIN'],
  'members:manage': ['OWNER', 'ADMIN'],
  'projects:create': ['OWNER', 'ADMIN'],
  'projects:delete': ['OWNER', 'ADMIN'],
  'queues:manage': ['OWNER', 'ADMIN', 'MEMBER'],
  'jobs:create': ['OWNER', 'ADMIN', 'MEMBER'],
  'jobs:cancel': ['OWNER', 'ADMIN', 'MEMBER'],
  'jobs:read': ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return (allowedRoles as readonly string[]).includes(role);
}
