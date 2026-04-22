import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkersPage() {
  return (
    <PageShell
      eyebrow="worker plane"
      title="workers"
      description="worker registration, health, and queue execution controls can land here once the python service starts reporting back."
    >
      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>dual-mode execution</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          cold subprocess and warm http forwarding are both anticipated by the spec. the UI scaffold does not assume either one wins.
        </CardContent>
      </Card>
    </PageShell>
  )
}
