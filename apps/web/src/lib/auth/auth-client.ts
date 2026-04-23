import { createAuthClient } from "better-auth/react"
import {
  lastLoginMethodClient,
  magicLinkClient,
} from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), lastLoginMethodClient()],
})
