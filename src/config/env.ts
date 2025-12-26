import dotenv from 'dotenv';
import { z } from 'zod';

// 加载 .env 文件
dotenv.config();

// 定义校验规则
const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // 必须是 URL 格式
  MONGO_URI: z.string().url(),
  // 必须至少 10 位
  JWT_SECRET: z.string().min(10),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
});

// 解析并导出
// 如果解析失败，这里会抛出异常并终止进程
export const config = envSchema.parse(process.env);