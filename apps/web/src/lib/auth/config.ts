import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { lastLoginMethod, magicLink } from "better-auth/plugins"

import { prisma } from "@/lib/db"
import { MAGIC_LINK_EXPIRES_IN_SECONDS, sendMagicLinkEmail } from "@/lib/auth/magic-link-email"

export const auth = betterAuth({
  appName: "daedalus",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  plugins: [
    magicLink({
      expiresIn: MAGIC_LINK_EXPIRES_IN_SECONDS,
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }) => sendMagicLinkEmail({ email, url }),
    }),
    lastLoginMethod({
      customResolveMethod: (ctx) => {
        if (ctx.path.endsWith("/magic-link/verify")) {
          return "magic-link"
        }

        return null
      },
    }),
    nextCookies(),
  ],
})

export type Auth = typeof auth
