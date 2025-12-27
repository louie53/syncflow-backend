import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from '../middlewares/auth.middleware'; // 记得引入这个接口
import Task from '../models/task.model';

// 1. 创建任务
export const createTask = async (req: Request, res: Response) => {
    try {
        // 这里的 req 必须断言成 AuthRequest，否则 TS 不知道里面有 userId
        const userId = (req as AuthRequest).userId;
        const { title, description } = req.body;

        if (!title) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title is required' });
            return;
        }

        // 👇 高光时刻！
        // 我们把前端传来的 title, description 和 保安传来的 userId 拼在一起
        const task = await Task.create({
            title,
            description,
            user: userId // ✅ 这里填入的就是真实的 User ID！
        });

        res.status(StatusCodes.CREATED).json({ task });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating task', error });
    }
};

// 2. 获取我的所有任务
export const getMyTasks = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId;

        // 👇 核心逻辑在这里！
        // 翻译：去 Task 表里找，条件是 { user: userId }
        // 只有 user 字段等于当前登录用户 ID 的任务，才会被找出来。
        const tasks = await Task.find({ user: userId });

        res.status(StatusCodes.OK).json({ count: tasks.length, tasks });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching tasks', error });
    }
};

// 3. 修改任务 (PUT)
export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id: taskId } = req.params; // 从 URL 里拿 ID
        const userId = (req as AuthRequest).userId;
        const { title, description, isCompleted } = req.body;

        // 👇 安全查询：必须同时满足 ID 和 User
        const task = await Task.findOneAndUpdate(
            { _id: taskId, user: userId },
            { title, description, isCompleted },
            { new: true, runValidators: true } // new: true 返回修改后的数据
        );

        if (!task) {
            // 找不到只有两种可能：1.任务不存在 2.任务存在但不是你的
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Task not found or not authorized' });
            return;
        }

        res.status(StatusCodes.OK).json({ task });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating task', error });
    }
};

// 4. 删除任务 (DELETE)
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id: taskId } = req.params;
        const userId = (req as AuthRequest).userId;

        // 👇 安全查询
        const task = await Task.findOneAndDelete({ _id: taskId, user: userId });

        if (!task) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Task not found or not authorized' });
            return;
        }

        res.status(StatusCodes.OK).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting task', error });
    }
};