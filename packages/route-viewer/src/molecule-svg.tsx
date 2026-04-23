"use client"

import { useEffect, useMemo, useRef } from "react"
import SmilesDrawer from "smiles-drawer"

export type MoleculeSvgProps = {
  smiles: string
  width?: number
  height?: number
  compactDrawing?: boolean
  scale?: number
  theme?: "light" | "dark"
}

function getDefaultTheme() {
  if (typeof document === "undefined") {
    return "light"
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function MoleculeSvg({
  smiles,
  width = 160,
  height = 120,
  compactDrawing = false,
  scale = 1,
  theme,
}: MoleculeSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const settings = useMemo(
    () => ({
      width,
      height,
      compactDrawing,
      bondThickness: 2,
      padding: 4,
      aromaticRingStyle: "kekule",
    }),
    [compactDrawing, height, width]
  )

  useEffect(() => {
    const drawer = new SmilesDrawer.SmiDrawer(settings, { scale })
    drawer.draw(smiles, svgRef.current, theme ?? getDefaultTheme(), false)
  }, [scale, settings, smiles, theme])

  return <svg ref={svgRef} width={width} height={height} aria-hidden="true" />
}
