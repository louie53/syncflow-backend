import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
// 👇 引入我们需要的所有 Service
import { createUserService, findUserByEmailService, findUserByIdService } from '../services/auth.service';
// 👇 引入我们定义的接口，为了让 TS 识别 req.userId
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. 注册 (Register)
export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  try {
    const { email } = req.body;

    // 查重
    const existingUser = await findUserByEmailService(email);
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'User already exists' });
    }

    // 创建
    const user = await createUserService(req.body);

    return res.status(StatusCodes.CREATED).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (e: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
};

// 2. 登录 (Login)
export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('email, password', email, password)
    // 找人
    const user = await findUserByEmailService(email);
    console.log('user', user)
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    // 验密码 (使用 Model 里的方法)
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }
    console.log('isValid', isValid)
    // 发 Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    return res.status(StatusCodes.OK).json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (e: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
};

// 👇 3. 获取当前用户信息 (Get Me)
export const getMe = async (req: Request, res: Response) => {
  try {
    // 获取中间件贴上去的 userId
    // 注意：这里需要断言为 AuthRequest
    const userId = (req as AuthRequest).userId;

    // 🛎️ 调用 Service 查数据库 (而不是直接在这里查)
    const user = await findUserByIdService(userId!);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    // 返回用户信息
    return res.status(StatusCodes.OK).json({ user });

  } catch (e: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching profile', error: e.message });
  }
};