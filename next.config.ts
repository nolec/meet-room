import dotenv from "dotenv";
import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  env: {
    // env 폴더의 .env.local 파일을 로드
    ...dotenv.config({
      path: join(process.cwd(), "env", ".env.local"),
    }).parsed,
  },
};

export default nextConfig;
