import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RuntimesPage() {
  return (
    <PageShell
      eyebrow="runtime plane"
      title="runtimes"
      description="reserve this surface for runtime registrations, warm service endpoints, and version/capability metadata."
    >
      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>contract-first</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          daedalus should only care about the runtime contract. model-specific implementation details stay in the model repos.
        </CardContent>
      </Card>
    </PageShell>
  )
}
