// middleware.ts
import nextAuthMiddleware from "next-auth/middleware";

export const middleware = nextAuthMiddleware;

export const config = {
  matcher: [
    "/finance/:path*",
    "/director/:path*",
    "/operations/:path*",
    "/employee/:path*",
  ],
};