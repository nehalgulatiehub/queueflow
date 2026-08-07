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
};
export function hasPermission(role, permission) {
    const allowedRoles = PERMISSIONS[permission];
    return allowedRoles.includes(role);
}
//# sourceMappingURL=rbac.js.map