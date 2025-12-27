import { Router } from 'express';
import { createTask, deleteTask, getMyTasks, updateTask } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// 🔒 关键一步：全员安检
// 这行代码意味着：在这个文件里定义的任何路由，都会先经过 authMiddleware
// 这样你就不用给每个接口单独加中间件了，非常省事！
router.use(authMiddleware);

// 定义路由
// 实际路径是: POST /api/tasks (因为我们在 app.ts 里会配前缀)
router.post('/', createTask);
router.get('/', getMyTasks);
// 👇 新增：修改 (PUT /tasks/:id)
router.put('/:id', updateTask);
// 👇 新增：删除 (DELETE /tasks/:id)
router.delete('/:id', deleteTask);


export default router;