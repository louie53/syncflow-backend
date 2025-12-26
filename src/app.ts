import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env'; // 使用相对路径

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
app.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'SyncFlow API is healthy 🚀',
        env: config.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

export default app;