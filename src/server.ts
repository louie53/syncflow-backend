import mongoose from 'mongoose';
import app from './app'; // 使用相对路径
import { config } from './config/env'; // 使用相对路径

const startServer = async () => {
    try {
        // 1. 连接数据库
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(config.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully!');

        // 2. 启动服务
        app.listen(config.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${config.PORT}`);
        });

    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

startServer();