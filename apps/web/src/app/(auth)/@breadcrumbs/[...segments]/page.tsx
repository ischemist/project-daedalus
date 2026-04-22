import { DefaultHeader } from "../_components/default-header"

type BreadcrumbPageProps = {
  params: Promise<{
    segments: string[]
  }>
}

export default async function BreadcrumbPage({ params }: BreadcrumbPageProps) {
  const { segments } = await params

  return <DefaultHeader segments={segments} />
}
