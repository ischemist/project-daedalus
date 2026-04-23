import { AuthCard } from "./_components/auth-card"

export default function SignInPage() {
  const oauthProviders = {
    github: Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ),
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_24%),linear-gradient(180deg,rgba(240,253,250,0.96),rgba(247,250,252,1))] px-6 py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.1),transparent_18%),linear-gradient(180deg,rgba(10,22,21,1),rgba(8,12,12,1))]">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl space-y-5">
          <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
            project daedalus
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-teal-700 md:text-5xl dark:text-teal-400">
              retrosynthesis runs on daedalus.
            </h1>
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              sign in to run any open retrosynthesis planner on a target
              molecule. we already handled the conda, the docker, the queue, and
              the json.
            </p>
          </div>
        </div>

        <AuthCard oauthProviders={oauthProviders} />
      </div>
    </main>
  )
}
