import { HeaderShell } from "@/components/header-shell"
import { ServerBreadcrumb } from "@/components/server-breadcrumb"

export function DefaultHeader({ segments = [] }: { segments?: string[] }) {
  return (
    <HeaderShell variant="aegean">
      <ServerBreadcrumb segments={segments} />
    </HeaderShell>
  )
}
