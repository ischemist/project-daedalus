import type { RouteVisualizationNode } from "@ischemist/routes"

import { prisma } from "../db"

export type RouteSummary = {
  id: string
  signature: string
  length: number
  hasConvergentReaction: boolean
  createdAt: string
  rootMoleculeId: string
  rootMolecule: {
    inchikey: string
    smiles: string | null
  }
  nodeCount: number
  stepCount: number
}

export type RouteTargetGroup = {
  rootMoleculeId: string
  rootMolecule: RouteSummary["rootMolecule"]
  routes: RouteSummary[]
}

export type RouteComparisonPageData = {
  groups: RouteTargetGroup[]
  selectedReference: RouteSummary | null
  selectedCompared: RouteSummary | null
  selectedGroupTrees: Array<{
    route: RouteSummary
    tree: RouteVisualizationNode
  }>
  referenceTree: RouteVisualizationNode | null
  comparedTree: RouteVisualizationNode | null
}

function toSummary(route: {
  id: string
  signature: string
  length: number
  hasConvergentReaction: boolean
  createdAt: Date
  rootMoleculeId: string
  rootMolecule: {
    inchikey: string
    canonicalSmiles: string | null
  }
  _count: {
    nodes: number
    steps: number
  }
}): RouteSummary {
  return {
    id: route.id,
    signature: route.signature,
    length: route.length,
    hasConvergentReaction: route.hasConvergentReaction,
    createdAt: route.createdAt.toISOString(),
    rootMoleculeId: route.rootMoleculeId,
    rootMolecule: {
      inchikey: route.rootMolecule.inchikey,
      smiles: route.rootMolecule.canonicalSmiles,
    },
    nodeCount: route._count.nodes,
    stepCount: route._count.steps,
  }
}

function groupRouteSummaries(routes: RouteSummary[]): RouteTargetGroup[] {
  const groups = new Map<string, RouteTargetGroup>()

  for (const route of routes) {
    const existing = groups.get(route.rootMoleculeId)
    if (existing) {
      existing.routes.push(route)
      continue
    }

    groups.set(route.rootMoleculeId, {
      rootMoleculeId: route.rootMoleculeId,
      rootMolecule: route.rootMolecule,
      routes: [route],
    })
  }

  return Array.from(groups.values()).sort((left, right) => {
    const routeCount = right.routes.length - left.routes.length
    if (routeCount !== 0) return routeCount
    return left.rootMolecule.inchikey.localeCompare(right.rootMolecule.inchikey)
  })
}

export async function listRouteTargetGroups(): Promise<RouteTargetGroup[]> {
  const routes = await prisma.route.findMany({
    orderBy: [
      { rootMoleculeId: "asc" },
      { length: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      rootMolecule: {
        select: {
          inchikey: true,
          canonicalSmiles: true,
        },
      },
      _count: {
        select: {
          nodes: true,
          steps: true,
        },
      },
    },
  })

  return groupRouteSummaries(routes.map(toSummary))
}

export async function getRouteVisualizationTree(
  routeId: string
): Promise<RouteVisualizationNode | null> {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    select: {
      rootNodeId: true,
      nodes: {
        select: {
          id: true,
          molecule: {
            select: {
              inchikey: true,
              canonicalSmiles: true,
            },
          },
        },
      },
      steps: {
        select: {
          productNodeId: true,
          inputs: {
            orderBy: { position: "asc" },
            select: {
              routeNodeId: true,
            },
          },
        },
      },
    },
  })

  if (!route?.rootNodeId) {
    return null
  }

  const nodes = new Map(
    route.nodes.map((node) => [
      node.id,
      {
        smiles: node.molecule.canonicalSmiles ?? node.molecule.inchikey,
        inchikey: node.molecule.inchikey,
      },
    ])
  )
  const childrenByProductNode = new Map<string, string[]>()

  for (const step of route.steps) {
    childrenByProductNode.set(
      step.productNodeId,
      step.inputs.map((input) => input.routeNodeId)
    )
  }

  function buildNode(nodeId: string): RouteVisualizationNode {
    const node = nodes.get(nodeId)
    if (!node) {
      throw new Error(`route ${routeId} references missing node ${nodeId}`)
    }

    const children = childrenByProductNode.get(nodeId)?.map(buildNode)
    return {
      smiles: node.smiles,
      inchikey: node.inchikey,
      ...(children && children.length > 0 ? { children } : {}),
    }
  }

  return buildNode(route.rootNodeId)
}

export async function getRouteComparisonPageData({
  referenceRouteId,
  comparedRouteId,
}: {
  referenceRouteId?: string
  comparedRouteId?: string
}): Promise<RouteComparisonPageData> {
  const groups = await listRouteTargetGroups()
  const routeById = new Map(
    groups.flatMap((group) => group.routes.map((route) => [route.id, route]))
  )

  let selectedReference =
    referenceRouteId === undefined ? undefined : routeById.get(referenceRouteId)
  let selectedCompared =
    comparedRouteId === undefined ? undefined : routeById.get(comparedRouteId)

  if (
    !selectedReference ||
    !selectedCompared ||
    selectedReference.rootMoleculeId !== selectedCompared.rootMoleculeId
  ) {
    const fallbackGroup =
      groups.find((group) => group.routes.length >= 2) ?? groups[0]
    selectedReference = fallbackGroup?.routes[0]
    selectedCompared = fallbackGroup?.routes[1] ?? fallbackGroup?.routes[0]
  }

  const [referenceTree, comparedTree] = await Promise.all([
    selectedReference ? getRouteVisualizationTree(selectedReference.id) : null,
    selectedCompared ? getRouteVisualizationTree(selectedCompared.id) : null,
  ])
  const selectedGroup = groups.find(
    (group) => group.rootMoleculeId === selectedReference?.rootMoleculeId
  )
  const selectedGroupTrees = selectedGroup
    ? (
        await Promise.all(
          selectedGroup.routes.map(async (route) => {
            const tree = await getRouteVisualizationTree(route.id)
            return tree ? { route, tree } : null
          })
        )
      ).filter(
        (
          entry
        ): entry is { route: RouteSummary; tree: RouteVisualizationNode } =>
          entry !== null
      )
    : []

  return {
    groups,
    selectedReference: selectedReference ?? null,
    selectedCompared: selectedCompared ?? null,
    selectedGroupTrees,
    referenceTree,
    comparedTree,
  }
}
