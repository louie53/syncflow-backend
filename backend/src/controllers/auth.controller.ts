import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/auth.middleware';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { createUserService, findUserByEmailService, findUserByIdService } from '../services/auth.service';
import { deleteRefreshToken, getRefreshToken, storeRefreshToken } from '../services/redis.service';

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
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' } // Access Token 短期有效
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' } // Refresh Token 长期有效
    );

    // 存储 Refresh Token 到 Redis (有效期 7 天)
    await storeRefreshToken(user._id.toString(), refreshToken, 7 * 24 * 60 * 60);

    return res.status(StatusCodes.OK).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
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

// 4. 刷新 Token (Refresh Token)
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Refresh token is required' });
    }

    // 1. 验证 Token 是否合法且未过期
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string };

    // 2. 检查 Redis 中是否存在且一致 (防止已登出或被禁用)
    const storedToken = await getRefreshToken(payload.userId);
    if (!storedToken || storedToken !== token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
    }

    // 3. 签发新的 Access Token
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' }
    );

    return res.status(StatusCodes.OK).json({
      accessToken: newAccessToken
    });
  } catch (e: any) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired refresh token' });
  }
};

// 5. 登出 (Logout)
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    if (userId) {
      await deleteRefreshToken(userId);
    }
    return res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (e: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
};