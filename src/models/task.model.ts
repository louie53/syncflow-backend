import mongoose, { Document, Schema } from 'mongoose';

// 1. 定义接口 (Interface)
// 这里的 user 字段类型是 string，因为在数据库里存的是 User 的 ID
export interface ITask extends Document {
    title: string;
    description?: string;
    isCompleted: boolean;
    user: mongoose.Types.ObjectId; // 👈 重点：这就叫“关联”
}

// 2. 定义 Schema (图纸)
const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'Please provide a task title'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        // 👇 这一段是 MongoDB 建立关系的“标准咒语”
        user: {
            type: mongoose.Schema.Types.ObjectId, // 类型是 ID
            ref: 'User', // 关联哪个模型？关联 'User' 模型！
            required: true, // 任务必须有主人，不能是无主孤魂
        },
    },
    { timestamps: true } // 自动生成 createdAt 和 updatedAt
);

// 3. 导出模型
export const Task = mongoose.model<ITask>('Task', taskSchema);