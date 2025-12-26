import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose'; // 引入 Document 和 Schema 类型

// 1. 定义接口：告诉 TS 我们的 User 文档长什么样，有哪些方法
// 继承 Document 意味着它自动拥有 _id, save(), remove() 等标准方法
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  // 👇 重点在这里：显式声明我们有一个自定义方法
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 2. 钩子函数
userSchema.pre('save', async function (next) { // 这里 next 其实可以保留，只要处理好逻辑
  // TS 可能会抱怨 'this' 的类型，我们需要断言它是 IUser
  const user = this as unknown as IUser;

  if (!user.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);
});

// 3. 挂载方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as unknown as IUser;
  // 此时 user.password 是加密后的乱码
  return await bcrypt.compare(candidatePassword, user.password);
};

// 4. 导出模型时，把接口 <IUser> 传进去
// 这样以后你在 Controller 里调用 User.findOne()，TS 就知道返回的是 IUser 类型了
export const User = mongoose.model<IUser>('User', userSchema);