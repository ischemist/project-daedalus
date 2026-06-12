import type {
  RetrocastMolecule,
  RetrocastReaction,
  RetrocastRoute,
} from "./types.js"

const SHA256_INITIAL_HASH = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
] as const

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
] as const

function rotateRight(value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits))
}

export function sha256Hex(value: string): string {
  const bytes = new TextEncoder().encode(value)
  const bitLength = bytes.length * 8
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64
  const padded = new Uint8Array(paddedLength)
  const view = new DataView(padded.buffer)

  padded.set(bytes)
  padded[bytes.length] = 0x80
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000))
  view.setUint32(paddedLength - 4, bitLength >>> 0)

  const hash: number[] = [...SHA256_INITIAL_HASH]
  const words = new Uint32Array(64)

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4)
    }

    for (let index = 16; index < 64; index += 1) {
      const s0 =
        rotateRight(words[index - 15], 7) ^
        rotateRight(words[index - 15], 18) ^
        (words[index - 15] >>> 3)
      const s1 =
        rotateRight(words[index - 2], 17) ^
        rotateRight(words[index - 2], 19) ^
        (words[index - 2] >>> 10)
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, h] = hash

    for (let index = 0; index < 64; index += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + s1 + ch + SHA256_K[index] + words[index]) >>> 0
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    hash[0] = (hash[0] + a) >>> 0
    hash[1] = (hash[1] + b) >>> 0
    hash[2] = (hash[2] + c) >>> 0
    hash[3] = (hash[3] + d) >>> 0
    hash[4] = (hash[4] + e) >>> 0
    hash[5] = (hash[5] + f) >>> 0
    hash[6] = (hash[6] + g) >>> 0
    hash[7] = (hash[7] + h) >>> 0
  }

  return hash.map((chunk) => chunk.toString(16).padStart(8, "0")).join("")
}

function normalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeJson)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, normalizeJson(child)])
    )
  }

  return value
}

export function hashJson(value: unknown): string {
  return sha256Hex(JSON.stringify(normalizeJson(value)))
}

function moleculeKey(molecule: RetrocastMolecule): string {
  return molecule.inchikey
}

export function reactionKey(
  reaction: RetrocastReaction,
  productInchikey: string
): [string, string, string[]] {
  return [
    "rxn",
    productInchikey,
    reaction.reactants.map((reactant) => moleculeKey(reactant)).sort(),
  ]
}

export function computeReactionSignature(
  reaction: RetrocastReaction,
  productInchikey: string
): string {
  return hashJson(reactionKey(reaction, productInchikey))
}

export function moleculeSubtreeKey(molecule: RetrocastMolecule): unknown[] {
  if (!molecule.product_of) {
    return ["mol", moleculeKey(molecule)]
  }

  const childSignatures = molecule.product_of.reactants
    .map(computeMoleculeSubtreeSignature)
    .sort()

  return [
    "mol",
    moleculeKey(molecule),
    reactionKey(molecule.product_of, molecule.inchikey),
    childSignatures,
  ]
}

export function computeMoleculeSubtreeSignature(
  molecule: RetrocastMolecule
): string {
  return hashJson(moleculeSubtreeKey(molecule))
}

export function computeRouteLength(root: RetrocastMolecule): number {
  if (!root.product_of) {
    return 0
  }

  return 1 + Math.max(0, ...root.product_of.reactants.map(computeRouteLength))
}

export function countRouteSteps(root: RetrocastMolecule): number {
  if (!root.product_of) {
    return 0
  }

  return (
    1 +
    root.product_of.reactants.reduce(
      (total, reactant) => total + countRouteSteps(reactant),
      0
    )
  )
}

export function computeRootReactionSignature(
  routeOrRoot: RetrocastRoute | RetrocastMolecule
): string | null {
  const root = "target" in routeOrRoot ? routeOrRoot.target : routeOrRoot
  if (!root.product_of) {
    return null
  }

  return computeReactionSignature(root.product_of, root.inchikey)
}

export function getRootReactantInchikeys(
  routeOrRoot: RetrocastRoute | RetrocastMolecule
): string[] {
  const root = "target" in routeOrRoot ? routeOrRoot.target : routeOrRoot
  return root.product_of?.reactants.map((reactant) => reactant.inchikey) ?? []
}

export function getRootProductInchikey(
  routeOrRoot: RetrocastRoute | RetrocastMolecule
): string {
  const root = "target" in routeOrRoot ? routeOrRoot.target : routeOrRoot
  return root.inchikey
}

export function hasConvergentReaction(root: RetrocastMolecule): boolean {
  if (!root.product_of) {
    return false
  }

  const nonLeafReactants = root.product_of.reactants.filter(
    (reactant) => reactant.product_of != null
  )

  if (nonLeafReactants.length >= 2) {
    return true
  }

  return root.product_of.reactants.some(hasConvergentReaction)
}
