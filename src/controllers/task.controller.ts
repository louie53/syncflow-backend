import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// 👇 引入 schema 类型 (为了智能提示)
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
// 👇 引入刚才招聘的厨师 (Service)
import { AuthRequest } from '../middlewares/auth.middleware'; // 记得这个是我们定义的带 userId 的请求
import {
    createTaskService,
    deleteTaskService,
    findAndUpdateTaskService,
    findUserTasksService
} from '../services/task.service';

// 1. 创建任务
export const createTask = async (
    req: Request<{}, {}, CreateTaskInput>, // 👈这里用了泛型，告诉TS req.body 是 CreateTaskInput
    res: Response
) => {
    try {
        const userId = (req as AuthRequest).userId;
        const body = req.body;

        // 🛎️ Controller 只负责喊人：调用 Service
        const task = await createTaskService(body, userId!);

        return res.status(StatusCodes.CREATED).json({ task });
    } catch (e: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e.message });
    }
};

// 2. 获取列表
export const getMyTasks = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId;

        // 🛎️ 喊人
        const tasks = await findUserTasksService(userId!);

        return res.status(StatusCodes.OK).json({ tasks });
    } catch (e: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e.message });
    }
};

// 3. 修改任务
export const updateTask = async (
    req: Request<{ id: string }, {}, UpdateTaskInput>,
    res: Response
) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).userId;
        const update = req.body;

        // 🛎️ 喊人
        const updatedTask = await findAndUpdateTaskService(
            { _id: id, user: userId! }, // 只能改自己的
            update,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Task not found' });
        }

        return res.status(StatusCodes.OK).json({ task: updatedTask });
    } catch (e: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e.message });
    }
};

// 4. 删除任务
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).userId;

        // 🛎️ 喊人
        const result = await deleteTaskService({ _id: id, user: userId! });

        // 如果没有删除任何东西 (没找到或者不是你的)
        if (result.deletedCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Task not found' });
        }

        return res.status(StatusCodes.OK).json({ message: 'Task deleted' });
    } catch (e: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e.message });
    }
};