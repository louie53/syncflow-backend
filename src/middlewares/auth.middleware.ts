import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

// 🛠️ TypeScript 特殊处理：
// Express 默认的 Request 对象里没有 `user` 这个属性。
// 我们需要扩展它，告诉 TS：“经过我这个中间件的 Request，里面会多一个 userId”。
export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // 1. 检查：我们要找 Header 里的 Authorization 字段
    const authHeader = req.headers.authorization;

    // 这里的逻辑是：
    // - 如果根本没带 Header
    // - 或者 Header 不是以 "Bearer " 开头的 (规定格式)
    // -> 直接拒绝
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication invalid' });
        return; // 记得 return，否则代码会继续往下跑
    }

    // 2. 提取：Token 长这样 "Bearer eyJhbGci..."
    // 我们用空格切割，取第 2 部分，也就是纯 Token
    const token = authHeader.split(' ')[1];

    try {
        // 3. 验证：拿出验卡机 (jwt.verify)
        // 参数1: 你的 token
        // 参数2: 你的私密印章 (必须和签发时用的一模一样)
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string };

        // 4. 贴标签：验证成功了！
        // 我们把解析出来的 userId 挂载到 req 对象上。
        // 这样，后面的 Controller 就能通过 req.userId 知道是谁了。
        (req as AuthRequest).userId = payload.userId;

        // 5. 放行：开门！
        next();

    } catch (error) {
        // 如果 jwt.verify 抛出错误 (比如过期了，或者签名不对)
        // -> 拒绝访问
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication invalid' });
    }
};