// Removed unused NextAuth import
import { DefaultSession } from "next-auth"
import type { Profile } from './index'

declare module "next-auth" {
  /**
   * Extend the built-in session types by adding an ID property
   */
  interface Session {
    user: {
      id: string
      profile?: Profile
    } & DefaultSession["user"]
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string
    profile?: Profile
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    profile?: Profile
  }
}
