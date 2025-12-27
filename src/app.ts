import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env'; // 使用相对路径
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes'; // 👈 1. 引入新路由

const app = express();

// --- 中间件配置 ---
app.use(helmet()); // 安全头
app.use(cors());   // 跨域支持
app.use(express.json()); // 解析 JSON 请求体

// 开发环境下打印日志
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- 基础路由 ---
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'SyncFlow API is healthy 🚀',
        env: config.NODE_ENV,
        timestamp: new Date().toLocaleString(),
        tiemzone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
});

// --- 路由挂载 ---
// <--- 【2. 启用路由】
// 以后凡是 '/api/auth' 开头的请求，都交给 authRoutes 处理
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); // 👈 2. 挂载在这里

export default app;