import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="settings"
      title="settings"
      description="basic operational settings live here now: auth posture, local docker assumptions, and database wiring."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>auth</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            better auth is configured for email/password with prisma-backed sessions and protected top-level routes.
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>database</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            postgres is the source of truth. the prisma schema is split by domain so planning models can expand cleanly from here.
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
