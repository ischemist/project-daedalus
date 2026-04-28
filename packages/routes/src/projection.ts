import {
  computeMoleculeSubtreeSignature,
  computeReactionSignature,
  computeRouteLength,
  hasConvergentReaction,
} from "./identity.js"
import type {
  JsonObject,
  ProjectedMolecule,
  ProjectedReaction,
  ProjectedReactionInput,
  ProjectedRouteNode,
  ProjectedRouteStep,
  ProjectedRouteStepInput,
  RetrocastMolecule,
  RetrocastRoute,
  RetrocastRoutesByTarget,
  RouteProjection,
  RouteProjectionRecords,
  RouteVisualizationNode,
} from "./types.js"

type MutableProjection = {
  molecules: Map<string, ProjectedMolecule>
  reactions: Map<string, ProjectedReaction>
  reactionInputs: ProjectedReactionInput[]
  nodes: ProjectedRouteNode[]
  steps: ProjectedRouteStep[]
  stepInputs: ProjectedRouteStepInput[]
  nodeCounter: number
  stepCounter: number
}

type ProjectionOptions = {
  targetId?: string
}

function metadataOrEmpty(metadata: JsonObject | undefined): JsonObject {
  return metadata ?? {}
}

function assertRetrocastMolecule(
  value: unknown,
  path: string
): asserts value is RetrocastMolecule {
  if (!value || typeof value !== "object") {
    throw new Error(`${path} must be an object`)
  }

  const molecule = value as Partial<RetrocastMolecule>
  if (typeof molecule.smiles !== "string") {
    throw new Error(`${path}.smiles must be a string`)
  }
  if (typeof molecule.inchikey !== "string") {
    throw new Error(`${path}.inchikey must be a string`)
  }
  if (
    molecule.synthesis_step !== null &&
    molecule.synthesis_step !== undefined
  ) {
    const step = molecule.synthesis_step as Partial<{ reactants: unknown }>
    if (!Array.isArray(step.reactants)) {
      throw new Error(`${path}.synthesis_step.reactants must be an array`)
    }
    step.reactants.forEach((reactant, index) => {
      assertRetrocastMolecule(
        reactant,
        `${path}.synthesis_step.reactants[${index}]`
      )
    })
  }
}

export function assertRetrocastRoute(
  value: unknown,
  path = "route"
): asserts value is RetrocastRoute {
  if (!value || typeof value !== "object") {
    throw new Error(`${path} must be an object`)
  }

  const route = value as Partial<RetrocastRoute>
  assertRetrocastMolecule(route.target, `${path}.target`)
}

export function parseRetrocastRoutes(value: unknown): RetrocastRoutesByTarget {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      "retrocast routes payload must be an object keyed by target id"
    )
  }

  const routesByTarget: RetrocastRoutesByTarget = {}
  for (const [targetId, routes] of Object.entries(value)) {
    if (!Array.isArray(routes)) {
      throw new Error(
        `retrocast routes payload for target ${targetId} must be an array`
      )
    }

    routesByTarget[targetId] = routes.map((route, index) => {
      assertRetrocastRoute(route, `routes[${targetId}][${index}]`)
      return route
    })
  }

  return routesByTarget
}

function createVisualizationNode(
  molecule: RetrocastMolecule
): RouteVisualizationNode {
  const children = molecule.synthesis_step?.reactants.map(
    createVisualizationNode
  )
  return {
    smiles: molecule.smiles,
    inchikey: molecule.inchikey,
    ...(children && children.length > 0 ? { children } : {}),
  }
}

function rememberMolecule(
  state: MutableProjection,
  molecule: RetrocastMolecule
): void {
  if (!state.molecules.has(molecule.inchikey)) {
    state.molecules.set(molecule.inchikey, {
      inchikey: molecule.inchikey,
      smiles: molecule.smiles,
      metadata: metadataOrEmpty(molecule.metadata),
    })
  }
}

function rememberReaction(
  state: MutableProjection,
  molecule: RetrocastMolecule,
  signature: string
): string {
  const reactionRef = `reaction:${signature}`
  if (!molecule.synthesis_step) {
    return reactionRef
  }

  if (!state.reactions.has(reactionRef)) {
    state.reactions.set(reactionRef, {
      ref: reactionRef,
      signature,
      productInchikey: molecule.inchikey,
    })

    const sortedReactants = molecule.synthesis_step.reactants
      .map((reactant, sourceIndex) => ({ reactant, sourceIndex }))
      .sort((a, b) => {
        const keyCompare = a.reactant.inchikey.localeCompare(
          b.reactant.inchikey
        )
        return keyCompare === 0 ? a.sourceIndex - b.sourceIndex : keyCompare
      })

    sortedReactants.forEach(({ reactant }, position) => {
      state.reactionInputs.push({
        reactionRef,
        moleculeInchikey: reactant.inchikey,
        position,
        stoichiometry: 1,
      })
    })
  }

  return reactionRef
}

function visitMolecule(
  state: MutableProjection,
  molecule: RetrocastMolecule,
  depth: number,
  rootSignature: string | undefined
): string {
  rememberMolecule(state, molecule)

  const nodeIndex = state.nodeCounter++
  const nodeRef = `node:${nodeIndex}`
  const computedSubtreeSignature = computeMoleculeSubtreeSignature(molecule)
  const subtreeSignature =
    nodeIndex === 0 && rootSignature ? rootSignature : computedSubtreeSignature

  state.nodes.push({
    ref: nodeRef,
    moleculeInchikey: molecule.inchikey,
    nodeIndex,
    depth,
    subtreeSignature,
  })

  if (!molecule.synthesis_step) {
    return nodeRef
  }

  const reactionSignature = computeReactionSignature(
    molecule.synthesis_step,
    molecule.inchikey
  )
  const reactionRef = rememberReaction(state, molecule, reactionSignature)
  const stepIndex = state.stepCounter++
  const stepRef = `step:${stepIndex}`

  state.steps.push({
    ref: stepRef,
    reactionRef,
    productNodeRef: nodeRef,
    stepIndex,
    mappedSmiles: molecule.synthesis_step.mapped_smiles ?? null,
    template: molecule.synthesis_step.template ?? null,
    reagents: molecule.synthesis_step.reagents ?? null,
    solvents: molecule.synthesis_step.solvents ?? null,
    metadata: metadataOrEmpty(molecule.synthesis_step.metadata),
  })

  molecule.synthesis_step.reactants.forEach((reactant, position) => {
    const childRef = visitMolecule(state, reactant, depth + 1, undefined)
    state.stepInputs.push({
      routeStepRef: stepRef,
      routeNodeRef: childRef,
      position,
    })
  })

  return nodeRef
}

export function projectRetrocastRoute(
  route: RetrocastRoute,
  options: ProjectionOptions = {}
): RouteProjection {
  assertRetrocastRoute(route)

  const computedSignature = computeMoleculeSubtreeSignature(route.target)
  const signature = route.signature ?? computedSignature
  const state: MutableProjection = {
    molecules: new Map(),
    reactions: new Map(),
    reactionInputs: [],
    nodes: [],
    steps: [],
    stepInputs: [],
    nodeCounter: 0,
    stepCounter: 0,
  }

  const rootNodeRef = visitMolecule(state, route.target, 0, signature)

  const records: RouteProjectionRecords = {
    molecules: Array.from(state.molecules.values()),
    reactions: Array.from(state.reactions.values()),
    reactionInputs: state.reactionInputs,
    route: {
      signature,
      computedSignature,
      rootMoleculeInchikey: route.target.inchikey,
      rootNodeRef,
      length: route.length ?? computeRouteLength(route.target),
      hasConvergentReaction:
        route.has_convergent_reaction ?? hasConvergentReaction(route.target),
      source: {
        targetId: options.targetId,
        rank: route.rank,
        retrocastVersion: route.retrocast_version,
        metadata: metadataOrEmpty(route.metadata),
        sourceSignature: route.signature,
        sourceContentHash: route.content_hash,
      },
    },
    nodes: state.nodes,
    steps: state.steps,
    stepInputs: state.stepInputs,
  }

  return {
    ...records,
    visualizationTree: createVisualizationNode(route.target),
  }
}

export function routeProjectionToRecords(
  projection: RouteProjection
): RouteProjectionRecords {
  return {
    molecules: projection.molecules,
    reactions: projection.reactions,
    reactionInputs: projection.reactionInputs,
    route: projection.route,
    nodes: projection.nodes,
    steps: projection.steps,
    stepInputs: projection.stepInputs,
  }
}

export function routeProjectionToVisualizationTree(
  projection: RouteProjection
): RouteVisualizationNode {
  return projection.visualizationTree
}

export function projectRetrocastRoutes(
  routesByTarget: RetrocastRoutesByTarget
): RouteProjection[] {
  return Object.entries(routesByTarget).flatMap(([targetId, routes]) =>
    routes.map((route) => projectRetrocastRoute(route, { targetId }))
  )
}
