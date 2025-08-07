import NextAuth, { type NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import type { UserRole } from "./types"
import Credentials from "next-auth/providers/credentials"

// Felles NextAuth v5-konfig
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-post', type: 'email' },
        password: { label: 'Passord', type: 'password' },
      },
      async authorize(creds) {
        const email = String(creds?.email || '')
        const password = String(creds?.password || '')
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ 
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true }
        })
        if (!user?.passwordHash) return null
        const bcrypt = await import('bcryptjs')
        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  // Aktiver Credentials for klassisk registrering/logg inn
  // Vi bruker egen DB-kolonne passwordHash, og validerer manuelt
  // Registrering gjøres i egen API-route, der vi hasher passord og oppretter bruker
  experimental: {
    enableWebAuthn: false,
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token }) {
      // Hent oppdatert brukerinfo fra database ved hver request
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            firstName: true,
            lastName: true,
            phone: true,
            companyName: true,
            orgNumber: true,
          }
        })

        if (dbUser) {
          token.role = dbUser.role as UserRole
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
          token.phone = dbUser.phone
          token.companyName = dbUser.companyName
          token.orgNumber = dbUser.orgNumber
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.firstName = token.firstName as string | null | undefined
        session.user.lastName = token.lastName as string | null | undefined
        session.user.phone = token.phone as string | null | undefined
        session.user.companyName = token.companyName as string | null | undefined
        session.user.orgNumber = token.orgNumber as string | null | undefined
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      try {
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            role: 'customer',
            firstName: user.name?.split(' ')[0] || null,
            lastName: (user.name?.split(' ').slice(1).join(' ') || null) as string | null,
          },
        })
      } catch (e) {
        console.warn('Kunne ikke sette default rolle/ navn for ny bruker:', e)
      }
    },
  },
}

// Eksporter v5 helpers (auth for server, handlers for API route, signIn/signOut klient/server)
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)

// Midlertidig kompat-eksport for eksisterende kall som bruker getServerSession(authOptions)
export const authOptions = authConfig

// Hjelpefunksjoner for å erstatte Clerk-funksjonalitet
export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.firstName || '',
    lastName: session.user.lastName || '',
    role: session.user.role,
    name: session.user.name,
    image: session.user.image,
    phone: session.user.phone,
    companyName: session.user.companyName,
    orgNumber: session.user.orgNumber,
  }
}

// Sjekk om bruker har spesifikk rolle
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) return false
  
  // Admin har tilgang til alt
  if (user.role === 'admin') return true
  
  // Moderator har tilgang til customer-ting
  if (user.role === 'moderator' && requiredRole === 'customer') return true
  
  return user.role === requiredRole
}

// Redirect hvis ikke riktig rolle
export async function requireRole(requiredRole: UserRole) {
  const { redirect } = await import('next/navigation')
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  const hasAccess = await hasRole(requiredRole)
  
  if (!hasAccess) {
    redirect('/dashboard')
  }
  
  return user
}

// Middleware hjelpefunksjon for å sjekke roller
export function checkRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  
  // Admin har tilgang til alt
  if (userRole === 'admin') return true
  
  // Moderator har tilgang til customer-ting
  if (userRole === 'moderator' && requiredRole === 'customer') return true
  
  return userRole === requiredRole
}