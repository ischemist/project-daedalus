import { ActivityIcon, DatabaseIcon, ServerCogIcon, WorkflowIcon } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const cards = [
  {
    title: "scheduler",
    description: "fairness loop lands here next. for now the shell and auth boundary are in place.",
    icon: WorkflowIcon,
  },
  {
    title: "worker plane",
    description: "warm/cold execution status cards can slot into this grid without touching the layout contract.",
    icon: ServerCogIcon,
  },
  {
    title: "postgres",
    description: "prisma auth models are ready; planning tables can follow in separate schema fragments.",
    icon: DatabaseIcon,
  },
  {
    title: "runtime registry",
    description: "model-specific runtimes stay external. this app just needs the contract and the control surface.",
    icon: ActivityIcon,
  },
]

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="authenticated shell"
      title="dashboard"
      description="the protected app frame is live: better auth gates access, the sidebar is persistent, and breadcrumbs are driven through a parallel route."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="rounded-3xl border-border/70">
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                placeholder surface only. wire real data with server components under suspense when the domain layer lands.
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageShell>
  )
}
