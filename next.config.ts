import dotenv from "dotenv";
import type { NextConfig } from "next";
import { join } from "path";

// 환경에 따라 적절한 env 파일 경로 결정
const getEnvPath = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const envFile = nodeEnv === "production" ? ".env.prod" : ".env.local";
  return join(process.cwd(), "env", envFile);
};

// 환경에 맞는 env 파일 로드
const envPath = getEnvPath();
const envConfig = dotenv.config({ path: envPath });

const nextConfig: NextConfig = {
  env: {
    // 환경에 따라 .env.local 또는 .env.prod 파일을 로드
    ...(envConfig.parsed || {}),
  },
};

export default nextConfig;
