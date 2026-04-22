import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.85),rgba(250,247,242,1))] dark:bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_25%),linear-gradient(180deg,rgba(20,18,16,1),rgba(12,10,9,1))]">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16 md:px-8">
        <div className="max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">project daedalus</p>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              orchestration for retrosynthesis execution, with only the useful shell left standing.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              this scaffold wires postgres, prisma, better auth, docker, ci, and the authenticated shell so the real
              product surface can land on stable ground.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="px-6">
              <Link href="/signin">enter the platform</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6">
              <Link href="/manage/design-language">view design language</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>control plane</CardTitle>
              <CardDescription>next.js app router shell with better auth and prisma-backed sessions.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/60 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>ui baseline</CardTitle>
              <CardDescription>the protected dashboard shell and design language reference are the only kept surfaces for now.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/60 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>infra baseline</CardTitle>
              <CardDescription>dockerized postgres and github workflows ready for the first real slices of platform code.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              prisma 7.7.0 · better auth 1.6.5
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
