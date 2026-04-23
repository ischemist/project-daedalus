import { cn } from "@/lib/utils"

type PageShellProps = {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageShellProps) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10",
        className
      )}
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}
