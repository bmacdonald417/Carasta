import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;
      const reviewModeEnabled = process.env.REVIEW_MODE_ENABLED === "true";

      if (reviewModeEnabled && pathname.startsWith("/review")) {
        return true;
      }

      // Admin routes: require ADMIN role
      if (pathname.startsWith("/admin")) {
        if (reviewModeEnabled) return true;
        return token?.role === "ADMIN";
      }

      // Settings: require any authenticated user
      if (pathname === "/settings") {
        if (reviewModeEnabled) return true;
        return !!token;
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
});

export const config = {
  matcher: ["/admin/:path*", "/settings", "/review"],
};
