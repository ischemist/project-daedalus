import { getLatestChangelogEntry } from "@/lib/changelog"

import { SidebarFooterMeta as SidebarFooterMetaClient } from "../client/app-sidebar"

export function SidebarFooterMeta() {
  const latestEntry = getLatestChangelogEntry()

  return (
    <SidebarFooterMetaClient
      version={latestEntry?.version ?? null}
      versionDate={latestEntry?.date ?? null}
    />
  )
}
