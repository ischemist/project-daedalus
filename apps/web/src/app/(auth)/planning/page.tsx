import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlanningPage() {
  return (
    <PageShell
      eyebrow="planning"
      title="submission surface"
      description="this is the future entrypoint for target molecules, model selection, and batch creation. auth, routing, and layout are already done."
    >
      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>next slice</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          add the first server-rendered planning form here. keep the page synchronous and push any db reads into nested
          async server components behind suspense.
        </CardContent>
      </Card>
    </PageShell>
  )
}
