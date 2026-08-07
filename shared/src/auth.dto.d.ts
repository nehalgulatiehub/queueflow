import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    organizationName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    organizationName: string;
}, {
    email: string;
    password: string;
    fullName: string;
    organizationName: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    description?: string | undefined;
}, {
    name: string;
    slug: string;
    description?: string | undefined;
}>;
export declare const createApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    expiresInDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    permissions: string[];
    expiresInDays?: number | undefined;
}, {
    name: string;
    permissions?: string[] | undefined;
    expiresInDays?: number | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
//# sourceMappingURL=auth.dto.d.ts.map