export type ChangelogEntry = {
  version: string
  date: string
  title: string
  summary: string
  changes: string[]
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "2026-04-22",
    title: "sidebar chrome refresh",
    summary: "aligned the auth shell sidebar with grow's denser navigation and footer pattern.",
    changes: [
      "flattened sidebar navigation so each menu item renders on a single line.",
      "reworked the sidebar footer to show theme toggle, changelog version, and avatar access.",
      "moved version metadata into a local changelog file instead of deriving it from application data.",
    ],
  },
]

export function getLatestChangelogEntry() {
  return changelogEntries[0] ?? null
}
