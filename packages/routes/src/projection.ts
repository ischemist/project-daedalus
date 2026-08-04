import {
  computeMoleculeSubtreeSignature,
  computeReactionSignature,
  computeRouteLength,
  hasConvergentReaction,
} from "./identity.js"
import type {
  RetrocastCandidate,
  RetrocastCandidatesByTarget,
  RetrocastFailureCandidate,
  JsonObject,
  ProjectedMolecule,
  ProjectedReaction,
  ProjectedReactionInput,
  ProjectedRouteNode,
  ProjectedRouteStep,
  ProjectedRouteStepInput,
  RetrocastMolecule,
  RetrocastReaction,
  RetrocastRoute,
  RetrocastRouteCandidate,
  RouteProjection,
  RouteProjectionRecords,
  RouteInspectionNode,
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
  rank?: number
}

function annotationsOrEmpty(annotations: JsonObject | undefined): JsonObject {
  return annotations ?? {}
}

function assertRetrocastMolecule(
  value: unknown,
  path: string
): asserts value is RetrocastMolecule {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
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
    molecule.annotations !== undefined &&
    (typeof molecule.annotations !== "object" ||
      Array.isArray(molecule.annotations))
  ) {
    throw new Error(`${path}.annotations must be a json object`)
  }
  if (molecule.product_of != null) {
    if (
      typeof molecule.product_of !== "object" ||
      Array.isArray(molecule.product_of)
    ) {
      throw new Error(`${path}.product_of must be an object or null`)
    }
    const reaction = molecule.product_of as Partial<RetrocastReaction>
    if (!Array.isArray(reaction.reactants)) {
      throw new Error(`${path}.product_of.reactants must be an array`)
    }
    for (const field of ["mapped_reaction_smiles", "template"] as const) {
      if (reaction[field] != null && typeof reaction[field] !== "string") {
        throw new Error(`${path}.product_of.${field} must be a string or null`)
      }
    }
    for (const field of ["reagents", "solvents"] as const) {
      if (
        reaction[field] != null &&
        (!Array.isArray(reaction[field]) ||
          reaction[field].some((item) => typeof item !== "string"))
      ) {
        throw new Error(
          `${path}.product_of.${field} must be an array of strings or null`
        )
      }
    }
    if (
      reaction.annotations !== undefined &&
      (typeof reaction.annotations !== "object" ||
        Array.isArray(reaction.annotations))
    ) {
      throw new Error(`${path}.product_of.annotations must be a json object`)
    }
    reaction.reactants.forEach((reactant, index) => {
      assertRetrocastMolecule(
        reactant,
        `${path}.product_of.reactants[${index}]`
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
  if (route.schema_version !== "2") {
    throw new Error(`${path}.schema_version must be "2"`)
  }
  if (
    route.annotations !== undefined &&
    (typeof route.annotations !== "object" || Array.isArray(route.annotations))
  ) {
    throw new Error(`${path}.annotations must be a json object`)
  }
}

function assertRetrocastFailure(
  value: unknown,
  path: string
): asserts value is RetrocastFailureCandidate["failure"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${path} must be an object`)
  }

  const failure = value as Partial<RetrocastFailureCandidate["failure"]>
  if (typeof failure.code !== "string" || failure.code.length === 0) {
    throw new Error(`${path}.code must be a non-empty string`)
  }
  for (const field of [
    "message",
    "target_id",
    "target_smiles",
    "target_inchikey",
  ] as const) {
    if (failure[field] != null && typeof failure[field] !== "string") {
      throw new Error(`${path}.${field} must be a string or null`)
    }
  }
  if (
    failure.context !== undefined &&
    (typeof failure.context !== "object" || Array.isArray(failure.context))
  ) {
    throw new Error(`${path}.context must be a json object`)
  }
}

export function isRetrocastRouteCandidate(
  candidate: RetrocastCandidate
): candidate is RetrocastRouteCandidate {
  return candidate.route != null
}

export function isRetrocastFailureCandidate(
  candidate: RetrocastCandidate
): candidate is RetrocastFailureCandidate {
  return candidate.failure != null
}

export function assertRetrocastCandidate(
  value: unknown,
  path = "candidate"
): asserts value is RetrocastCandidate {
  if (!value || typeof value !== "object") {
    throw new Error(`${path} must be an object`)
  }

  const candidate = value as Partial<RetrocastCandidate>
  if (!Number.isInteger(candidate.rank) || (candidate.rank ?? 0) < 1) {
    throw new Error(`${path}.rank must be a positive integer`)
  }
  const hasRoute = candidate.route != null
  const hasFailure = candidate.failure != null
  if (!hasRoute && !hasFailure) {
    throw new Error(`${path} must contain route or failure`)
  }
  if (hasRoute && hasFailure) {
    throw new Error(`${path} cannot contain both route and failure`)
  }
  if (hasRoute) {
    assertRetrocastRoute(candidate.route, `${path}.route`)
  } else {
    assertRetrocastFailure(candidate.failure, `${path}.failure`)
  }
}

export function parseRetrocastCandidates(
  value: unknown
): RetrocastCandidatesByTarget {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      "retrocast candidates payload must be an object keyed by target id"
    )
  }

  const candidatesByTarget = Object.create(null) as RetrocastCandidatesByTarget
  for (const [targetId, candidates] of Object.entries(value)) {
    if (!Array.isArray(candidates)) {
      throw new Error(
        `retrocast candidates payload for target ${targetId} must be an array`
      )
    }

    const parsedCandidates = candidates.map((candidate, index) => {
      assertRetrocastCandidate(candidate, `candidates[${targetId}][${index}]`)
      return candidate
    })
    const ranks = new Set(parsedCandidates.map((candidate) => candidate.rank))
    if (ranks.size !== parsedCandidates.length) {
      throw new Error(`candidates[${targetId}] contains duplicate ranks`)
    }
    candidatesByTarget[targetId] = parsedCandidates
  }

  return candidatesByTarget
}

function createVisualizationNode(
  molecule: RetrocastMolecule
): RouteVisualizationNode {
  const children = molecule.product_of?.reactants.map(createVisualizationNode)
  return {
    smiles: molecule.smiles,
    inchikey: molecule.inchikey,
    ...(children && children.length > 0 ? { children } : {}),
  }
}

function childMoleculeRef(parentRef: string, index: number): string {
  return parentRef === "rc:m:/" ? `rc:m:/${index}` : `${parentRef}/${index}`
}

function createInspectionNode(
  molecule: RetrocastMolecule,
  depth: number,
  ref: string
): RouteInspectionNode {
  const children =
    molecule.product_of?.reactants.map((reactant, index) =>
      createInspectionNode(reactant, depth + 1, childMoleculeRef(ref, index))
    ) ?? []
  const reaction = molecule.product_of
  const nonLeafReactants =
    reaction?.reactants.filter((reactant) => reactant.product_of != null) ?? []

  return {
    ref,
    molecule: {
      smiles: molecule.smiles,
      inchikey: molecule.inchikey,
      metadata: annotationsOrEmpty(molecule.annotations),
    },
    depth,
    children,
    ...(reaction
      ? {
          incomingStep: {
            ref: ref.replace("rc:m:", "rc:r:"),
            reactionSignature: computeReactionSignature(
              reaction,
              molecule.inchikey
            ),
            mappedSmiles: reaction.mapped_reaction_smiles ?? null,
            template: reaction.template ?? null,
            reagents: reaction.reagents ?? null,
            solvents: reaction.solvents ?? null,
            metadata: annotationsOrEmpty(reaction.annotations),
            isConvergent: nonLeafReactants.length >= 2,
          },
        }
      : {}),
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
      metadata: annotationsOrEmpty(molecule.annotations),
    })
  }
}

function rememberReaction(
  state: MutableProjection,
  molecule: RetrocastMolecule,
  signature: string
): string {
  const reactionRef = `reaction:${signature}`
  if (!molecule.product_of) {
    return reactionRef
  }

  if (!state.reactions.has(reactionRef)) {
    state.reactions.set(reactionRef, {
      ref: reactionRef,
      signature,
      productInchikey: molecule.inchikey,
    })

    const sortedReactants = molecule.product_of.reactants
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
  path: string
): string {
  rememberMolecule(state, molecule)

  const nodeIndex = state.nodeCounter++
  const nodeRef = `rc:m:/${path}`
  const computedSubtreeSignature = computeMoleculeSubtreeSignature(molecule)

  state.nodes.push({
    ref: nodeRef,
    moleculeInchikey: molecule.inchikey,
    nodeIndex,
    depth,
    subtreeSignature: computedSubtreeSignature,
  })

  if (!molecule.product_of) {
    return nodeRef
  }

  const reactionSignature = computeReactionSignature(
    molecule.product_of,
    molecule.inchikey
  )
  const nonLeafReactants = molecule.product_of.reactants.filter(
    (reactant) => reactant.product_of != null
  )
  const reactionRef = rememberReaction(state, molecule, reactionSignature)
  const stepIndex = state.stepCounter++
  const stepRef = `rc:r:/${path}`

  state.steps.push({
    ref: stepRef,
    reactionRef,
    productNodeRef: nodeRef,
    stepIndex,
    mappedSmiles: molecule.product_of.mapped_reaction_smiles ?? null,
    template: molecule.product_of.template ?? null,
    reagents: molecule.product_of.reagents ?? null,
    solvents: molecule.product_of.solvents ?? null,
    metadata: annotationsOrEmpty(molecule.product_of.annotations),
    isConvergent: nonLeafReactants.length >= 2,
  })

  molecule.product_of.reactants.forEach((reactant, position) => {
    const childPath = path ? `${path}/${position}` : `${position}`
    const childRef = visitMolecule(state, reactant, depth + 1, childPath)
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
  const signature = computedSignature
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

  const rootNodeRef = visitMolecule(state, route.target, 0, "")

  const records: RouteProjectionRecords = {
    molecules: Array.from(state.molecules.values()),
    reactions: Array.from(state.reactions.values()),
    reactionInputs: state.reactionInputs,
    route: {
      signature,
      computedSignature,
      rootMoleculeInchikey: route.target.inchikey,
      rootNodeRef,
      length: computeRouteLength(route.target),
      hasConvergentReaction: hasConvergentReaction(route.target),
      source: {
        targetId: options.targetId,
        rank: options.rank,
        annotations: annotationsOrEmpty(route.annotations),
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

export function retrocastRouteToInspectionTree(
  route: RetrocastRoute
): RouteInspectionNode {
  assertRetrocastRoute(route)
  return createInspectionNode(route.target, 0, "rc:m:/")
}

export function routeProjectionToInspectionTree(
  projection: RouteProjection
): RouteInspectionNode {
  const moleculeByInchikey = new Map(
    projection.molecules.map((molecule) => [molecule.inchikey, molecule])
  )
  const nodeByRef = new Map(projection.nodes.map((node) => [node.ref, node]))
  const stepsByProductNodeRef = new Map(
    projection.steps.map((step) => [step.productNodeRef, step])
  )
  const reactionByRef = new Map(
    projection.reactions.map((reaction) => [reaction.ref, reaction])
  )
  const stepInputsByStepRef = new Map<string, ProjectedRouteStepInput[]>()

  for (const input of projection.stepInputs) {
    const inputs = stepInputsByStepRef.get(input.routeStepRef) ?? []
    inputs.push(input)
    stepInputsByStepRef.set(input.routeStepRef, inputs)
  }

  function visit(nodeRef: string): RouteInspectionNode {
    const node = nodeByRef.get(nodeRef)
    if (!node) {
      throw new Error(`projection node ${nodeRef} was not found`)
    }

    const molecule = moleculeByInchikey.get(node.moleculeInchikey)
    if (!molecule) {
      throw new Error(
        `projection molecule ${node.moleculeInchikey} was not found`
      )
    }

    const step = stepsByProductNodeRef.get(node.ref)
    const children = step
      ? [...(stepInputsByStepRef.get(step.ref) ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((input) => visit(input.routeNodeRef))
      : []
    const reaction = step ? reactionByRef.get(step.reactionRef) : undefined

    return {
      ref: node.ref,
      molecule,
      depth: node.depth,
      children,
      ...(step
        ? {
            incomingStep: {
              ref: step.ref,
              reactionSignature: reaction?.signature ?? step.reactionRef,
              mappedSmiles: step.mappedSmiles,
              template: step.template,
              reagents: step.reagents,
              solvents: step.solvents,
              metadata: step.metadata,
              isConvergent: step.isConvergent,
            },
          }
        : {}),
    }
  }

  return visit(projection.route.rootNodeRef)
}

export function projectRetrocastCandidates(
  candidatesByTarget: RetrocastCandidatesByTarget
): RouteProjection[] {
  return Object.entries(candidatesByTarget).flatMap(([targetId, candidates]) =>
    candidates.flatMap((candidate) =>
      isRetrocastRouteCandidate(candidate)
        ? [
            projectRetrocastRoute(candidate.route, {
              targetId,
              rank: candidate.rank,
            }),
          ]
        : []
    )
  )
}
