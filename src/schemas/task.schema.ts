import { z } from 'zod';

const payload = {
    body: z.object({
        // 标题：必填
        title: z.string({
            required_error: 'Title is required',
        }),
        // 描述：选填
        description: z.string().optional(),
        // 完成状态：选填
        isCompleted: z.boolean().optional(),
    }),
};

const params = {
    params: z.object({
        // ID：必须存在且是字符串
        id: z.string({
            required_error: 'Task ID is required',
        }),
    }),
};

// 1. 创建任务规则 (只验证 Body)
export const createTaskSchema = z.object({
    ...payload,
});

// 2. 修改任务规则 (验证 URL里的ID + Body)
export const updateTaskSchema = z.object({
    ...params,
    body: z.object({
        title: z.string().optional(), // 修改时标题可以不传
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
    }),
});

// 3. 删除/获取单个任务规则 (只验证 URL里的ID)
export const getTaskSchema = z.object({
    ...params,
});

// 导出类型给 Controller 用
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];