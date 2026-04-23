import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.16),transparent_30%),linear-gradient(180deg,rgba(240,253,250,0.92),rgba(247,250,252,1))] dark:bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.18),transparent_25%),linear-gradient(180deg,rgba(9,19,18,1),rgba(8,12,12,1))]">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16 md:px-8">
        <div className="max-w-5xl space-y-5">
          <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
            project daedalus
          </p>
          <div className="space-y-5">
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">
              <span className="block text-teal-700/55 dark:text-teal-400/55">
                chemistry runs on retrosynthesis.
              </span>
              <span className="block text-teal-700 dark:text-teal-400">
                retrosynthesis runs on daedalus.
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              an open-source workspace that turns every open retrosynthesis
              planner into a one-click tool. built for chemists who need
              answers, and model developers who&apos;d rather release chemistry
              than maintain a ui.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="aegean" className="px-6">
              <Link href="/signin">start planning</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="aegean" className="backdrop-blur">
            <CardHeader>
              <CardTitle>plan, don&apos;t plumb.</CardTitle>
              <CardDescription>
                drop in a target, pick a planner, get a route back. conda envs,
                docker builds, queue management, and json wrangling — all
                handled.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card variant="aegean" className="backdrop-blur">
            <CardHeader>
              <CardTitle>ship chemistry, not streamlit.</CardTitle>
              <CardDescription>
                plug your retrosynthesis model into daedalus and get a
                chemistry-aware ui, run history, and real users — the day your
                model merges.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card variant="aegean" className="backdrop-blur">
            <CardHeader>
              <CardTitle>open all the way down.</CardTitle>
              <CardDescription>
                daedalus is open source. run it on a laptop, a lab gpu box, or
                institutional hpc. fork it, add a planner, send a pr. no vendor,
                no lock-in, no surprise paywall.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  )
}
