import { Router } from 'express';
import { login, register } from '../controllers/auth.controller'; // 引入大厨

const router = Router();

// 这里的路径只是 '/register'
// 因为我们在 app.ts 里会统一加前缀 '/api/auth'
// 所以最终地址是 POST /api/auth/register
router.post('/register', register);
router.post('/login', login);

export default router;