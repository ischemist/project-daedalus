"use client"

import { useEffect, useState } from "react"
import { Handle, Position } from "@xyflow/react"
import type { Node, NodeProps } from "@xyflow/react"
import { CheckIcon, CopyIcon, InfoIcon, PackageIcon } from "lucide-react"
import type { RouteGraphNode, VendorSource } from "@ischemist/routes"

import { MoleculeSvg } from "./molecule-svg.js"

const statusStyles: Record<string, React.CSSProperties> = {
  "in-stock": { borderColor: "#0f766e" },
  default: { borderColor: "var(--ischemist-route-node-border-default)" },
  match: { borderColor: "#0f766e" },
  extension: { borderColor: "#b45309" },
  ghost: {
    borderColor: "var(--ischemist-route-node-border-ghost)",
    borderStyle: "dashed",
    opacity: 0.62,
  },
  "pred-shared": { borderColor: "#64748b", borderWidth: 2.5 },
  "pred-1-only": { borderColor: "#b45309" },
  "pred-2-only": { borderColor: "#b45309", borderStyle: "dashed" },
  "overlay-all": { borderColor: "#92400e", borderWidth: 3 },
  "overlay-some": { borderColor: "#b45309", borderWidth: 2.25 },
  "overlay-one": { borderColor: "#f59e0b", borderWidth: 1.5 },
}

const vendorNames: Record<VendorSource, string> = {
  MCULE: "mcule",
  LABNETWORK: "labnetwork",
  EMOLECULES: "emolecules",
  SIGMA_ALDRICH: "sigma aldrich",
  CHEMBRIDGE: "chembridge",
  MC: "mcule",
  LN: "labnetwork",
  EM: "emolecules",
  SA: "sigma aldrich",
  CB: "chembridge",
}

function formatPrice(ppg: number) {
  if (ppg < 1) return `$${ppg.toFixed(2)}/g`
  if (ppg < 100) return `$${ppg.toFixed(1)}/g`
  if (ppg < 1000) return `$${ppg.toFixed(0)}/g`
  if (ppg < 10000) return `$${(ppg / 1000).toFixed(1)}k/g`
  return `$${Math.round(ppg / 1000)}k/g`
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        alignItems: "center",
        background: "transparent",
        border: 0,
        color: "inherit",
        cursor: "pointer",
        display: "inline-flex",
        height: 24,
        justifyContent: "center",
        padding: 0,
        width: 24,
      }}
    >
      {children}
    </button>
  )
}

export function MoleculeNode({ data }: NodeProps<Node<RouteGraphNode>>) {
  const { smiles, inchikey, status, inStock, ppg, source, leadTime, link } =
    data
  const [copiedField, setCopiedField] = useState<"smiles" | "inchikey" | null>(
    null
  )
  const [showDetails, setShowDetails] = useState(false)

  async function copyText(text: string, field: "smiles" | "inchikey") {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
    } catch {
      setCopiedField(null)
    }
  }

  useEffect(() => {
    if (!copiedField) return undefined
    const timeout = window.setTimeout(() => setCopiedField(null), 1600)
    return () => window.clearTimeout(timeout)
  }, [copiedField])

  const showStockBadge =
    status === "in-stock" ||
    status === "extension" ||
    status === "match" ||
    status === "pred-shared" ||
    status === "pred-1-only" ||
    status === "pred-2-only" ||
    status === "overlay-all" ||
    status === "overlay-some" ||
    status === "overlay-one" ||
    inStock === true
  const hasBuyableData = source != null && ppg != null
  const routeCount =
    typeof data.routeCount === "number" ? data.routeCount : undefined
  const routeTotal =
    typeof data.routeTotal === "number" ? data.routeTotal : undefined
  const statusStyle = statusStyles[status]

  return (
    <div
      className="ischemist-route-viewer-node"
      style={{
        ...statusStyle,
        background: "var(--ischemist-route-node-bg)",
        borderRadius: 8,
        borderStyle:
          statusStyle?.borderStyle ?? (status === "ghost" ? "dashed" : "solid"),
        borderWidth: statusStyle?.borderWidth ?? 2,
        boxShadow: "var(--ischemist-route-node-shadow)",
        color: "var(--foreground, #111827)",
        position: "relative",
        width: 178,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#9ca3af" }}
      />
      {routeCount && routeTotal ? (
        <div
          style={{
            left: 6,
            position: "absolute",
            top: 6,
            zIndex: 2,
          }}
        >
          <span
            aria-label={`${routeCount} of ${routeTotal} routes`}
            style={{
              alignItems: "center",
              background: "rgb(180 83 9 / 0.14)",
              border: "1px solid rgb(180 83 9 / 0.36)",
              borderRadius: 5,
              color: "#92400e",
              display: "inline-flex",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1,
              padding: "3px 5px",
            }}
          >
            {routeCount}/{routeTotal}
          </span>
        </div>
      ) : null}
      <div style={{ position: "absolute", right: 6, top: 6, zIndex: 2 }}>
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
          onFocusCapture={() => setShowDetails(true)}
          onBlurCapture={() => setShowDetails(false)}
        >
          <button
            type="button"
            aria-label="molecule details"
            style={{
              alignItems: "center",
              background: "transparent",
              border: 0,
              color: "#64748b",
              cursor: "help",
              display: "inline-flex",
              padding: 0,
            }}
          >
            <InfoIcon size={16} />
          </button>
          <div
            style={{
              background: "var(--popover, #ffffff)",
              border: "1px solid rgb(148 163 184 / 0.35)",
              borderRadius: 8,
              boxShadow: "0 12px 30px rgb(15 23 42 / 0.16)",
              color: "var(--popover-foreground, #111827)",
              display: showDetails ? "block" : "none",
              fontSize: 12,
              lineHeight: 1.45,
              padding: 12,
              position: "absolute",
              right: -8,
              top: 22,
              width: 320,
              zIndex: 50,
            }}
            className="ischemist-route-viewer-popover"
          >
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    smiles
                  </span>
                  <IconButton
                    label="copy smiles"
                    onClick={() => void copyText(smiles, "smiles")}
                  >
                    {copiedField === "smiles" ? (
                      <CheckIcon size={14} />
                    ) : (
                      <CopyIcon size={14} />
                    )}
                  </IconButton>
                </div>
                <div
                  style={{ fontFamily: "monospace", overflowWrap: "anywhere" }}
                >
                  {smiles}
                </div>
              </div>
              <div>
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    inchikey
                  </span>
                  <IconButton
                    label="copy inchikey"
                    onClick={() => void copyText(inchikey, "inchikey")}
                  >
                    {copiedField === "inchikey" ? (
                      <CheckIcon size={14} />
                    ) : (
                      <CopyIcon size={14} />
                    )}
                  </IconButton>
                </div>
                <div
                  style={{ fontFamily: "monospace", overflowWrap: "anywhere" }}
                >
                  {inchikey}
                </div>
              </div>
              {hasBuyableData ? (
                <div
                  style={{
                    borderTop: "1px solid rgb(148 163 184 / 0.3)",
                    paddingTop: 10,
                  }}
                >
                  <div
                    style={{
                      color: "#64748b",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    buyable information
                  </div>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>vendor</span>
                      <span>{vendorNames[source]}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>price</span>
                      <span>{formatPrice(ppg)}</span>
                    </div>
                    {leadTime ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>lead time</span>
                        <span>{leadTime}</span>
                      </div>
                    ) : null}
                    {link ? (
                      <a href={link} rel="noreferrer" target="_blank">
                        vendor page
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          padding: 8,
        }}
      >
        <MoleculeSvg smiles={smiles} />
        {showStockBadge ? (
          <span
            style={{
              alignItems: "center",
              background: inStock
                ? "rgb(16 185 129 / 0.14)"
                : "rgb(107 114 128 / 0.14)",
              borderRadius: 6,
              color: inStock ? "#047857" : "#4b5563",
              display: "inline-flex",
              fontSize: 12,
              fontWeight: 600,
              gap: 4,
              marginTop: 4,
              padding: "2px 6px",
            }}
          >
            <PackageIcon size={12} />
            {inStock ? "in stock" : "not in stock"}
          </span>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#9ca3af" }}
      />
    </div>
  )
}
