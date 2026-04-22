import { Fragment } from "react"
import Link from "next/link"

import { getBreadcrumbItems } from "@/lib/navigation"
import {
  Breadcrumb,
  BreadcrumbLink,
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
    return <p className="text-sm font-semibold text-teal-800 dark:text-teal-400">daedalus</p>
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage variant="aegean" className="font-semibold">
                  {item.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink variant="aegean" render={<Link href={item.href} />} className="text-sm">
                  {item.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 ? <BreadcrumbSeparator variant="aegean" /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
