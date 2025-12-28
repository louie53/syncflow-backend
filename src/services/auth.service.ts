import { User as UserModel } from '../models/user.model'; // 统一用 UserModel 别名
import { RegisterInput } from '../schemas/auth.schema';

// 1. 注册
export const createUserService = async (input: RegisterInput) => {
    return UserModel.create(input);
};

// 2. 通过邮箱找人 (登录用)
export const findUserByEmailService = async (email: string) => {
    return UserModel.findOne({ email }).select('+password'); // 注意：要把密码也查出来，用于比对
};

// 👇 3. 新增：通过 ID 找人 (GetMe 用)
export const findUserByIdService = async (userId: string) => {
    // .select('-password') 意思是：除了密码，其他的都给我
    return UserModel.findById(userId).select('-password');
};