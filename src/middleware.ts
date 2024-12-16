import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redirect unauthenticated users to this page
  },
  callbacks: {
    authorized(params) {
      return true;
    },
  }
});

export const config = {
  // Define which routes should use this middleware
  matcher: ["/feedback/:path*", "/interview/:path*"], // Protect specific routes
};
