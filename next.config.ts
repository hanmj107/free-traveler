import type { NextConfig } from "next";

// Playwright(playwright.config.ts)의 기본 baseURL은 127.0.0.1이다. Next.js 16의
// dev 서버는 기본적으로 이 origin의 HMR/dev 리소스 요청을 차단해(Cross-origin
// 보호) 클라이언트 JS가 제대로 hydrate되지 않고, Form 버튼이 계속 disabled로
// 보이는 등 E2E Test가 원인 불명으로 실패한다 — 프로덕션 빌드(`next build`)에는
// 영향이 없다.
const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
