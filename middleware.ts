import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      // Admin routes: require ADMIN role
      if (pathname.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }

      // Settings: require any authenticated user
      if (pathname === "/settings") {
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
  matcher: ["/admin/:path*", "/settings"],
};
