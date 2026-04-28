# @ischemist/route-viewer

react route visualization components for ischemist route projections.

this package renders visualization trees from `@ischemist/routes` with react flow and smiles-drawer. it is intentionally storage-agnostic: apps pass plain route visualization nodes and optional stock metadata.

## install

```sh
npm install @ischemist/route-viewer @ischemist/routes
```

## usage

```tsx
import { PredictionComparison } from "@ischemist/route-viewer"

export function RoutesPanel({ referenceRoute, comparedRoute }) {
  return (
    <PredictionComparison
      prediction1Route={referenceRoute}
      prediction2Route={comparedRoute}
      mode="side-by-side"
    />
  )
}
```

## exports

- `RouteGraph`
- `RouteComparison` for reference/accepted route comparisons
- `RouteOverlay`
- `PredictionComparison` for prediction-vs-prediction comparisons
- `RouteLegend`
- `MoleculeNode`
- `MoleculeSvg`
- `FlowPanel`
