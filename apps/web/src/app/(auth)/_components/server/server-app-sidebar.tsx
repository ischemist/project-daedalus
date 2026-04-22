import { AppSidebar } from "../client/app-sidebar"

import { requireRequestSession } from "@/lib/auth/session"

export async function ServerAppSidebar() {
  const session = await requireRequestSession()

  return (
    <AppSidebar
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  )
}
