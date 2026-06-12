import {
  computeMoleculeSubtreeSignature,
  computeReactionSignature,
  computeRouteLength,
  hasConvergentReaction,
} from "./identity.js"
import type {
  RetrocastCandidate,
  RetrocastCandidatesByTarget,
  JsonObject,
  ProjectedMolecule,
  ProjectedReaction,
  ProjectedReactionInput,
  ProjectedRouteNode,
  ProjectedRouteStep,
  ProjectedRouteStepInput,
  RetrocastMolecule,
  RetrocastRoute,
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
  if (molecule.product_of != null) {
    const reaction = molecule.product_of as Partial<{ reactants: unknown }>
    if (!Array.isArray(reaction.reactants)) {
      throw new Error(`${path}.product_of.reactants must be an array`)
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
}

function assertRetrocastCandidate(
  value: unknown,
  path: string
): asserts value is RetrocastCandidate {
  if (!value || typeof value !== "object") {
    throw new Error(`${path} must be an object`)
  }

  const candidate = value as Partial<RetrocastCandidate>
  if (typeof candidate.rank !== "number") {
    throw new Error(`${path}.rank must be a number`)
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

  const candidatesByTarget: RetrocastCandidatesByTarget = {}
  for (const [targetId, candidates] of Object.entries(value)) {
    if (!Array.isArray(candidates)) {
      throw new Error(
        `retrocast candidates payload for target ${targetId} must be an array`
      )
    }

    candidatesByTarget[targetId] = candidates.map((candidate, index) => {
      assertRetrocastCandidate(candidate, `candidates[${targetId}][${index}]`)
      return candidate
    })
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
      candidate.route
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
