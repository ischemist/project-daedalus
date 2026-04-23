declare module "smiles-drawer" {
  type DrawerSettings = Record<string, unknown>

  class SmiDrawer {
    constructor(settings: DrawerSettings, options?: DrawerSettings)
    draw(
      smiles: string,
      target: SVGElement | null,
      theme?: string,
      infoOnly?: boolean
    ): void
  }

  const SmilesDrawer: {
    SmiDrawer: typeof SmiDrawer
  }

  export default SmilesDrawer
}
