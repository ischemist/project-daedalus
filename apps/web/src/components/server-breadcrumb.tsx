import { Fragment } from "react"
import Link from "next/link"

import { getBreadcrumbItems } from "@/lib/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type ServerBreadcrumbProps = {
  segments: string[]
}

export function ServerBreadcrumb({ segments }: ServerBreadcrumbProps) {
  const items = getBreadcrumbItems(segments)

  if (items.length === 0) {
    return <p className="text-sm font-medium text-muted-foreground">daedalus</p>
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage className="font-medium">{item.title}</BreadcrumbPage>
              ) : (
                <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {item.title}
                </Link>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 ? <BreadcrumbSeparator /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
