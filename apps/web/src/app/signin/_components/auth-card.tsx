"use client"

import { useState, useSyncExternalStore } from "react"
import { useSearchParams } from "next/navigation"
import { MailIcon } from "lucide-react"

import { authClient } from "@/lib/auth/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SocialProvider = "github" | "google"

type AuthCardProps = {
  oauthProviders: Record<SocialProvider, boolean>
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }

  return "something went sideways. try again."
}

function getRedirectTo(searchParams: ReturnType<typeof useSearchParams>) {
  const nextPath = searchParams.get("redirectTo")
  return nextPath?.startsWith("/") ? nextPath : "/dashboard"
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0">
      <path fill="#4285f4" d="M21.64 12.23c0-.64-.06-1.25-.17-1.84H12v3.48h5.41a4.64 4.64 0 0 1-2 3.05v2.54h3.24c1.9-1.75 2.99-4.33 2.99-7.23Z" />
      <path fill="#34a853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.54c-.9.6-2.05.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H3.09v2.62A9.99 9.99 0 0 0 12 22Z" />
      <path fill="#fbbc04" d="M6.44 13.88A5.99 5.99 0 0 1 6.13 12c0-.65.11-1.28.31-1.88V7.5H3.09A9.99 9.99 0 0 0 2 12c0 1.61.38 3.13 1.09 4.5l3.35-2.62Z" />
      <path fill="#ea4335" d="M12 6.02c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 3 14.69 2 12 2A9.99 9.99 0 0 0 3.09 7.5l3.35 2.62c.78-2.35 2.97-4.1 5.56-4.1Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 fill-current">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.72.08-.72 1.2.09 1.83 1.2 1.83 1.2 1.06 1.81 2.78 1.29 3.46.98.11-.76.42-1.29.76-1.58-2.67-.3-5.47-1.32-5.47-5.86 0-1.29.47-2.35 1.22-3.18-.12-.3-.53-1.52.12-3.16 0 0 1-.32 3.3 1.21a11.54 11.54 0 0 1 6 0c2.3-1.53 3.29-1.21 3.29-1.21.66 1.64.25 2.86.13 3.16.76.83 1.22 1.89 1.22 3.18 0 4.55-2.81 5.56-5.49 5.85.43.37.81 1.1.81 2.23v3.31c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function LastUsedPill() {
  return (
    <span className="absolute top-0 right-3 -translate-y-1/2 rounded-full border border-teal-700/25 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-teal-700 dark:border-teal-500/35 dark:bg-zinc-950 dark:text-teal-400">
      last used
    </span>
  )
}

function subscribeToLastLoginMethod() {
  return () => {}
}

export function AuthCard({ oauthProviders }: AuthCardProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null)
  const lastMethod = useSyncExternalStore(
    subscribeToLastLoginMethod,
    () => authClient.getLastUsedLoginMethod(),
    () => null,
  )
  const searchParams = useSearchParams()
  const hasOauth = oauthProviders.github || oauthProviders.google
  const isBusy = isPending || socialPending !== null

  const submit = async () => {
    setError(null)
    setNotice(null)
    setIsPending(true)

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: getRedirectTo(searchParams),
      })

      if (result.error) {
        setError(getErrorMessage(result.error.message ?? result.error))
        return
      }

      setNotice(`magic link sent to ${email}. check your inbox.`)
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsPending(false)
    }
  }

  const signInWithSocial = async (provider: SocialProvider) => {
    setError(null)
    setNotice(null)
    setSocialPending(provider)

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: getRedirectTo(searchParams),
      })

      if (result?.error) {
        setError(getErrorMessage(result.error.message ?? result.error))
        setSocialPending(null)
      }
    } catch (error) {
      setError(getErrorMessage(error))
      setSocialPending(null)
    }
  }

  return (
    <Card className="border-teal-700/20 bg-white/88 backdrop-blur dark:border-teal-500/25 dark:bg-zinc-950/88">
      <CardContent className="space-y-5 pt-6">
        {hasOauth ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {oauthProviders.github ? (
              <div className="relative">
                <Button
                  type="button"
                  variant="aegeanOutline"
                  className={cn(
                    "w-full justify-center",
                    lastMethod === "github" && "border-teal-700/55 bg-teal-700/5 dark:border-teal-500/55 dark:bg-teal-500/10",
                  )}
                  disabled={isBusy}
                  onClick={() => void signInWithSocial("github")}
                >
                  <GitHubIcon />
                  {socialPending === "github" ? "redirecting..." : "continue with github"}
                </Button>
                {lastMethod === "github" ? <LastUsedPill /> : null}
              </div>
            ) : null}

            {oauthProviders.google ? (
              <div className="relative">
                <Button
                  type="button"
                  variant="aegeanOutline"
                  className={cn(
                    "w-full justify-center",
                    lastMethod === "google" && "border-teal-700/55 bg-teal-700/5 dark:border-teal-500/55 dark:bg-teal-500/10",
                  )}
                  disabled={isBusy}
                  onClick={() => void signInWithSocial("google")}
                >
                  <GoogleIcon />
                  {socialPending === "google" ? "redirecting..." : "continue with google"}
                </Button>
                {lastMethod === "google" ? <LastUsedPill /> : null}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border-[1.5px] border-dashed border-teal-700/20 bg-teal-700/4 px-3 py-2 text-xs leading-6 text-muted-foreground dark:border-teal-500/20 dark:bg-teal-500/8">
            github and google oauth will appear here once their provider credentials are set.
          </p>
        )}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-teal-700/15 dark:bg-teal-500/20" />
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {hasOauth ? "or use email" : "magic link"}
          </span>
          <div className="h-px flex-1 bg-teal-700/15 dark:bg-teal-500/20" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-teal-800 dark:text-teal-400">
            email
          </Label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-teal-700/55 dark:text-teal-400/60" />
            <Input
              id="email"
              type="email"
              variant="aegean"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={cn(
                "h-9 rounded-md bg-teal-700/[0.03] pr-3 pl-9 dark:bg-teal-500/[0.06]",
                lastMethod === "magic-link" &&
                  "border-teal-700/55 bg-teal-700/5 dark:border-teal-500/55 dark:bg-teal-500/10",
              )}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

        <div className="relative">
          <Button
            type="button"
            variant="aegean"
            className={cn(
              "w-full",
              lastMethod === "magic-link" && "border-teal-700/55 bg-teal-700/5 dark:border-teal-500/55 dark:bg-teal-500/10",
            )}
            disabled={isBusy || !email}
            onClick={() => void submit()}
          >
            <MailIcon />
            {isPending ? "sending..." : "email me a magic link"}
          </Button>
          {lastMethod === "magic-link" ? <LastUsedPill /> : null}
        </div>
      </CardContent>
    </Card>
  )
}
