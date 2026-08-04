import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)

void test("package exports support ESM import and Node 22 require", async () => {
  const importedRetrocastIo = await import("@ischemist/retrocast-io")
  const importedRoutes = await import("@ischemist/routes")
  const requiredRetrocastIo = require("@ischemist/retrocast-io")
  const requiredRoutes = require("@ischemist/routes")
  const requiredProjection = require("@ischemist/routes/projection")

  assert.equal(
    importedRetrocastIo.loadEvaluationBundleForImport,
    requiredRetrocastIo.loadEvaluationBundleForImport
  )
  assert.equal(
    importedRoutes.projectRetrocastRoute,
    requiredRoutes.projectRetrocastRoute
  )
  assert.equal(
    requiredRoutes.projectRetrocastRoute,
    requiredProjection.projectRetrocastRoute
  )
})
