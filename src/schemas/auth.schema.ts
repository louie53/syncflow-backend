import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        // Name: 必填且长度大于2
        name: z.string({
            required_error: 'Name is required', // v3 支持这种直观写法
        }).min(2, 'Name must be at least 2 characters long'),

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