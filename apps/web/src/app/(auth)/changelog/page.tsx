import { changelogEntries } from "@/lib/changelog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChangelogPage() {
  return (
    <div className="flex w-full flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        {changelogEntries.map((entry) => (
          <Card key={entry.version} variant="aegean">
            <CardHeader variant="aegean">
              <CardDescription>{entry.date}</CardDescription>
              <CardTitle>
                v{entry.version} · {entry.title}
              </CardTitle>
              <CardDescription>{entry.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {entry.changes.map((change) => (
                  <li key={change} className="flex gap-2">
                    <span className="mt-1 text-xs text-teal-600 dark:text-teal-400">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
