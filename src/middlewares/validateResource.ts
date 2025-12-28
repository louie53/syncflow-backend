import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AnyZodObject, ZodError } from 'zod';

// 这个函数接收一个 Zod Schema (规则)，返回一个 Express 中间件
const validateResource = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        // 🔍 核心动作：拿着规则去检查请求里的三个部分 (body, query, params)
        // 如果不合格，Zod 会直接抛出错误 (throw error)，进入 catch
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // ✅ 检查通过，放行！进入下一个环节 (Controller)
        next();
    } catch (e: any) {
        // ❌ 检查不通过
        if (e instanceof ZodError) {
            // 如果是 Zod 发现的格式错误，返回 400 和详细错误清单
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Validation failed',
                errors: e.errors, // 这里面包含了具体哪个字段错、错在哪
            });
        }

        // 如果是其他未知错误，继续抛出或返回 500
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};

export default validateResource;