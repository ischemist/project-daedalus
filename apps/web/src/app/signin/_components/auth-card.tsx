"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import { authClient } from "@/lib/auth/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

function formatLoginMethod(method: string) {
  return method.replaceAll("-", " ")
}

export function AuthCard() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [lastMethod] = useState<string | null>(() =>
    typeof document === "undefined" ? null : authClient.getLastUsedLoginMethod(),
  )
  const searchParams = useSearchParams()

  const submit = async () => {
    setError(null)
    setNotice(null)
    setIsPending(true)

    const result = await authClient.signIn.magicLink({
      email,
      callbackURL: getRedirectTo(searchParams),
    })

    if (result.error) {
      setError(getErrorMessage(result.error.message ?? result.error))
      setIsPending(false)
      return
    }

    setNotice(`magic link sent to ${email}. check your inbox.`)
    setIsPending(false)
  }

  return (
    <Card className="border-border/70 bg-card/90 backdrop-blur">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle>access daedalus</CardTitle>
          <CardDescription>enter your email and we’ll send a one-click sign-in link.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {lastMethod ? (
          <p className="text-sm text-muted-foreground">last sign-in method on this browser: {formatLoginMethod(lastMethod)}</p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

        <Button type="button" className="w-full" disabled={isPending || !email} onClick={() => void submit()}>
          {isPending ? "sending..." : "email me a magic link"}
        </Button>
      </CardContent>
    </Card>
  )
}
