import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ArtifactsPage() {
  return (
    <PageShell
      eyebrow="artifacts"
      title="artifacts"
      description="filesystem-backed outputs, normalized route payloads, and export surfaces can layer onto this route without changing the shared shell."
    >
      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>v1 stance</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          local disk first. no s3 ceremony until the product actually needs it.
        </CardContent>
      </Card>
    </PageShell>
  )
}
