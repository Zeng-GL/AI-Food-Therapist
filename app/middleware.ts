export { default } from "next-auth/middleware";

// 設定哪些路徑需要登入才能看
export const config = { 
  matcher: [
    "/home/:path*", 
    "/onboarding/:path*",
    "/profile/:path*",
    "trends/:path*",
  ] 
};