import { requireRequestSession } from "@/lib/auth/session"

export async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireRequestSession()

  return children
}
