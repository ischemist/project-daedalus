import { AuthCard } from "./_components/auth-card"

export default function SignInPage() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,rgba(255,251,235,0.96),rgba(250,247,242,1))] px-6 py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_18%),linear-gradient(180deg,rgba(28,25,23,1),rgba(12,10,9,1))]">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">control plane access</p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              request a magic link and enter the labyrinth.
            </h1>
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              better auth now rides on passwordless email links through resend, with the protected dashboard shell ready
              for the next real product pass.
            </p>
          </div>
        </div>

        <AuthCard />
      </div>
    </main>
  )
}
