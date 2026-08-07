export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export declare const PERMISSIONS: {
    readonly 'org:delete': readonly ["OWNER"];
    readonly 'org:update': readonly ["OWNER", "ADMIN"];
    readonly 'members:manage': readonly ["OWNER", "ADMIN"];
    readonly 'projects:create': readonly ["OWNER", "ADMIN"];
    readonly 'projects:delete': readonly ["OWNER", "ADMIN"];
    readonly 'queues:manage': readonly ["OWNER", "ADMIN", "MEMBER"];
    readonly 'jobs:create': readonly ["OWNER", "ADMIN", "MEMBER"];
    readonly 'jobs:cancel': readonly ["OWNER", "ADMIN", "MEMBER"];
    readonly 'jobs:read': readonly ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
};
export type Permission = keyof typeof PERMISSIONS;
export declare function hasPermission(role: Role, permission: Permission): boolean;
//# sourceMappingURL=rbac.d.ts.map