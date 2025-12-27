import { Router } from 'express';
import { getMe, login, register } from '../controllers/auth.controller'; // 引入大厨
import { authMiddleware } from '../middlewares/auth.middleware'; // 👈 导入中间件


const router = Router();

// 这里的路径只是 '/register'
// 因为我们在 app.ts 里会统一加前缀 '/api/auth'
// 所以最终地址是 POST /api/auth/register
router.post('/register', register);
router.post('/login', login);

// 👇 重点在这里！
// 语法：router.get(路径, 中间件, 控制器)
// 只有通过了 authMiddleware 这一关，才会执行 getMe 控制器
router.get('/me', authMiddleware, getMe);


export default router;