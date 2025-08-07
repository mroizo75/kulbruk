import NextAuth, { type NextAuthConfig } from "next-auth"

// Minimal, edge-kompatibel Auth.js-konfig for middleware
// Ingen Node-avhengigheter (ingen adapter, ingen email/nodemailer)
export const edgeAuthConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
}

export const { auth } = NextAuth(edgeAuthConfig)


