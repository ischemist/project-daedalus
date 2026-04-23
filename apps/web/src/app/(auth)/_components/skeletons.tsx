import { Skeleton } from "@/components/ui/skeleton"

export function SidebarSkeleton() {
  return (
    <aside className="hidden h-svh w-64 border-r border-border/60 bg-sidebar/80 p-4 md:flex md:flex-col">
      <Skeleton className="h-10 w-28 rounded-full" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-xl" />
        ))}
      </div>
    </aside>
  )
}

export function AuthLayoutSkeleton() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/80 px-4 py-5 backdrop-blur md:rounded-t-3xl">
        <Skeleton className="h-5 w-44" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-8 md:px-8">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  )
}
