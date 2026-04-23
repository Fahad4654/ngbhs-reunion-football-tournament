import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isCoAdminRoute = nextUrl.pathname.startsWith("/dashboard");
      
      if (isAdminRoute) {
        if (isLoggedIn && userRole === "ADMIN") return true;
        return false;
      }
      
      if (isCoAdminRoute) {
        if (isLoggedIn && (userRole === "ADMIN" || userRole === "CO_ADMIN")) return true;
        return false;
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role as any;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
