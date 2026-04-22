import { HeaderShell } from "@/components/header-shell"
import { ServerBreadcrumb } from "@/components/server-breadcrumb"

export function DefaultHeader({ segments = [] }: { segments?: string[] }) {
  return (
    <HeaderShell>
      <ServerBreadcrumb segments={segments} />
    </HeaderShell>
  )
}
