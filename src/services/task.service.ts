import { Task as TaskModel } from '../models/task.model';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

// 👨‍🍳 厨师 1：专门负责炒“创建任务”这道菜
// 注意：这里不需要 req 和 res，它只关心数据 (input)
export const createTaskService = async (input: CreateTaskInput, userId: string) => {
    // 纯粹的数据库操作
    return TaskModel.create({
        ...input,
        user: userId, // 关联用户
    });
};

// 👨‍🍳 厨师 2：专门负责“查找我的任务”
export const findUserTasksService = async (userId: string) => {
    return TaskModel.find({ user: userId });
};

// 👨‍🍳 厨师 3：专门负责“修改任务”
export const findAndUpdateTaskService = async (
    query: { _id: string; user: string }, // 查询条件：既要是这个ID，又要是这个人的
    update: UpdateTaskInput, // 更新内容
    options: { new: true } // 返回更新后的数据
) => {
    return TaskModel.findOneAndUpdate(query, update, options);
};

// 👨‍🍳 厨师 4：专门负责“删除任务”
export const deleteTaskService = async (query: { _id: string; user: string }) => {
    return TaskModel.deleteOne(query);
};