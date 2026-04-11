import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { env } from "@/lib/env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.authSecret,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});
