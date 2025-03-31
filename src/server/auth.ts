import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import type { UserRole, UserVerified } from "@/server/db/enums";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      verified_status: UserVerified;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    verified_status: UserVerified;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        verified_status: user.verified_status,
        role: user.role,
      },
    }),
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
