import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        // 🟢 新增 firstName
        firstName: z.string({
            required_error: 'First name is required',
        }).min(1, 'First name cannot be empty'),

        // 🟢 新增 lastName
        lastName: z.string({
            required_error: 'Last name is required',
        }).min(1, 'Last name cannot be empty'),

        // Email: 必填且格式正确
        email: z.string({
            required_error: 'Email is required',
        }).email('Invalid email address'), // v3 支持直接在这里写错误信息

        // Password: 必填且长度大于6
        password: z.string({
            required_error: 'Password is required',
        }).min(6, 'Password must be at least 6 characters long'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: 'Email is required',
        }).email('Invalid email address'),

        password: z.string({
            required_error: 'Password is required',
        }),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];