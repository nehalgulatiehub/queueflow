import { z } from 'zod';
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name is required'),
    organizationName: z.string().min(2, 'Organization name is required'),
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
export const createProjectSchema = z.object({
    name: z.string().min(2, 'Project name is required'),
    slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
    description: z.string().optional(),
});
export const createApiKeySchema = z.object({
    name: z.string().min(2, 'API key name is required'),
    permissions: z.array(z.string()).default(['queues:read', 'queues:write', 'jobs:read', 'jobs:write']),
    expiresInDays: z.number().optional(),
});
//# sourceMappingURL=auth.dto.js.map