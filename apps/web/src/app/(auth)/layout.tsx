import { Suspense } from "react"

import { SidebarInset } from "@/components/ui/sidebar"

import { ClientSidebarProvider } from "./_components/client/client-sidebar-provider"
import { AuthGate } from "./_components/server/auth-gate"
import { ServerAppSidebar } from "./_components/server/server-app-sidebar"
import { AuthLayoutSkeleton, SidebarSkeleton } from "./_components/skeletons"

export default function AuthenticatedLayout({
  children,
  breadcrumbs,
}: {
  children: React.ReactNode
  breadcrumbs: React.ReactNode
}) {
  return (
    <ClientSidebarProvider>
      <Suspense fallback={<SidebarSkeleton />}>
        <ServerAppSidebar />
      </Suspense>

      <SidebarInset className="bg-background">
        <Suspense fallback={<AuthLayoutSkeleton />}>
          <AuthGate>
            <div className="flex min-h-svh flex-col">
              {breadcrumbs}
              <div className="flex-1">{children}</div>
            </div>
          </AuthGate>
        </Suspense>
      </SidebarInset>
    </ClientSidebarProvider>
  )
}
