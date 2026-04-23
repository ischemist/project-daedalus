import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"

export const getRequestSession = cache(async () => auth.api.getSession({ headers: await headers() }))

export async function requireRequestSession() {
  const session = await getRequestSession()

  if (!session) {
    redirect("/signin")
  }

  return session
}
