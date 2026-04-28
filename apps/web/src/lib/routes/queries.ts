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

type RouteTreeRecord = {
  id: string
  rootNodeId: string | null
  nodes: Array<{
    id: string
    molecule: {
      inchikey: string
      canonicalSmiles: string | null
    }
  }>
  steps: Array<{
    productNodeId: string
    inputs: Array<{
      routeNodeId: string
    }>
  }>
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
  return (await getRouteVisualizationTrees([routeId])).get(routeId) ?? null
}

function buildRouteVisualizationTree(
  route: RouteTreeRecord
): RouteVisualizationNode | null {
  if (!route.rootNodeId) {
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
      throw new Error(`route ${route.id} references missing node ${nodeId}`)
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

export async function getRouteVisualizationTrees(
  routeIds: string[]
): Promise<Map<string, RouteVisualizationNode>> {
  const uniqueRouteIds = Array.from(new Set(routeIds))
  if (uniqueRouteIds.length === 0) {
    return new Map()
  }

  const routes = await prisma.route.findMany({
    where: { id: { in: uniqueRouteIds } },
    select: {
      id: true,
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

  const trees = new Map<string, RouteVisualizationNode>()
  for (const route of routes) {
    const tree = buildRouteVisualizationTree(route)
    if (tree) {
      trees.set(route.id, tree)
    }
  }

  return trees
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

  const selectedGroup = groups.find(
    (group) => group.rootMoleculeId === selectedReference?.rootMoleculeId
  )
  const routeIds = [
    ...(selectedReference ? [selectedReference.id] : []),
    ...(selectedCompared ? [selectedCompared.id] : []),
    ...(selectedGroup?.routes.map((route) => route.id) ?? []),
  ]
  const treesByRouteId = await getRouteVisualizationTrees(routeIds)
  const referenceTree = selectedReference
    ? (treesByRouteId.get(selectedReference.id) ?? null)
    : null
  const comparedTree = selectedCompared
    ? (treesByRouteId.get(selectedCompared.id) ?? null)
    : null
  const selectedGroupTrees = selectedGroup
    ? selectedGroup.routes.flatMap((route) => {
        const tree = treesByRouteId.get(route.id)
        return tree ? [{ route, tree }] : []
      })
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
