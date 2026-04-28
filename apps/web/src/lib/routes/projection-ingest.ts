import type { RouteProjection } from "@ischemist/routes"

import { prisma } from "../db"

const ROUTE_CANONICALIZER_VERSION = 1
const SUBTREE_CANONICALIZER_VERSION = 1

export type PersistRouteProjectionResult = {
  routeId: string
  reused: boolean
  moleculeCount: number
  reactionCount: number
  nodeCount: number
  stepCount: number
}

function expectId(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`missing ${label}`)
  }

  return value
}

export async function persistRouteProjection(
  projection: RouteProjection
): Promise<PersistRouteProjectionResult> {
  return prisma.$transaction(async (tx) => {
    const moleculeIds = new Map<string, string>()
    const reactionIds = new Map<string, string>()
    const nodeIds = new Map<string, string>()
    const stepIds = new Map<string, string>()

    for (const molecule of projection.molecules) {
      const stored = await tx.molecule.upsert({
        where: { inchikey: molecule.inchikey },
        update: { canonicalSmiles: molecule.smiles },
        create: {
          inchikey: molecule.inchikey,
          canonicalSmiles: molecule.smiles,
        },
        select: { id: true },
      })

      moleculeIds.set(molecule.inchikey, stored.id)
    }

    for (const reaction of projection.reactions) {
      const productId = expectId(
        moleculeIds.get(reaction.productInchikey),
        `product molecule ${reaction.productInchikey}`
      )
      const stored = await tx.reaction.upsert({
        where: {
          canonicalizerVersion_signature: {
            canonicalizerVersion: ROUTE_CANONICALIZER_VERSION,
            signature: reaction.signature,
          },
        },
        update: {},
        create: {
          canonicalizerVersion: ROUTE_CANONICALIZER_VERSION,
          signature: reaction.signature,
          productId,
        },
        select: { id: true },
      })

      reactionIds.set(reaction.ref, stored.id)
    }

    for (const input of projection.reactionInputs) {
      const reactionId = expectId(
        reactionIds.get(input.reactionRef),
        `reaction ${input.reactionRef}`
      )
      const moleculeId = expectId(
        moleculeIds.get(input.moleculeInchikey),
        `reaction input molecule ${input.moleculeInchikey}`
      )

      await tx.reactionInput.upsert({
        where: {
          reactionId_position: {
            reactionId,
            position: input.position,
          },
        },
        update: {
          moleculeId,
          stoichiometry: input.stoichiometry,
        },
        create: {
          reactionId,
          moleculeId,
          position: input.position,
          stoichiometry: input.stoichiometry,
        },
      })
    }

    const existingRoute = await tx.route.findUnique({
      where: {
        canonicalizerVersion_signature: {
          canonicalizerVersion: ROUTE_CANONICALIZER_VERSION,
          signature: projection.route.signature,
        },
      },
      select: {
        id: true,
        rootNodeId: true,
      },
    })

    if (existingRoute?.rootNodeId) {
      return {
        routeId: existingRoute.id,
        reused: true,
        moleculeCount: projection.molecules.length,
        reactionCount: projection.reactions.length,
        nodeCount: projection.nodes.length,
        stepCount: projection.steps.length,
      }
    }

    if (existingRoute) {
      throw new Error(
        `route ${projection.route.signature} already exists without a root node`
      )
    }

    const rootMoleculeId = expectId(
      moleculeIds.get(projection.route.rootMoleculeInchikey),
      `root molecule ${projection.route.rootMoleculeInchikey}`
    )

    const route = await tx.route.create({
      data: {
        canonicalizerVersion: ROUTE_CANONICALIZER_VERSION,
        signature: projection.route.signature,
        rootMoleculeId,
        length: projection.route.length,
        hasConvergentReaction: projection.route.hasConvergentReaction,
      },
      select: { id: true },
    })

    for (const node of projection.nodes) {
      const moleculeId = expectId(
        moleculeIds.get(node.moleculeInchikey),
        `route node molecule ${node.moleculeInchikey}`
      )
      const stored = await tx.routeNode.create({
        data: {
          routeId: route.id,
          moleculeId,
          nodeIndex: node.nodeIndex,
          depth: node.depth,
          subtreeSignature: node.subtreeSignature,
          subtreeCanonicalizerVersion: SUBTREE_CANONICALIZER_VERSION,
        },
        select: { id: true },
      })

      nodeIds.set(node.ref, stored.id)
    }

    const rootNodeId = expectId(
      nodeIds.get(projection.route.rootNodeRef),
      `root node ${projection.route.rootNodeRef}`
    )

    await tx.route.update({
      where: { id: route.id },
      data: { rootNodeId },
    })

    for (const step of projection.steps) {
      const reactionId = expectId(
        reactionIds.get(step.reactionRef),
        `route step reaction ${step.reactionRef}`
      )
      const productNodeId = expectId(
        nodeIds.get(step.productNodeRef),
        `route step product node ${step.productNodeRef}`
      )
      const stored = await tx.routeStep.create({
        data: {
          routeId: route.id,
          reactionId,
          productNodeId,
          stepIndex: step.stepIndex,
        },
        select: { id: true },
      })

      stepIds.set(step.ref, stored.id)
    }

    for (const input of projection.stepInputs) {
      const routeStepId = expectId(
        stepIds.get(input.routeStepRef),
        `route step ${input.routeStepRef}`
      )
      const routeNodeId = expectId(
        nodeIds.get(input.routeNodeRef),
        `route step input node ${input.routeNodeRef}`
      )

      await tx.routeStepInput.create({
        data: {
          routeStepId,
          routeNodeId,
          position: input.position,
        },
      })
    }

    return {
      routeId: route.id,
      reused: false,
      moleculeCount: projection.molecules.length,
      reactionCount: projection.reactions.length,
      nodeCount: projection.nodes.length,
      stepCount: projection.steps.length,
    }
  })
}
