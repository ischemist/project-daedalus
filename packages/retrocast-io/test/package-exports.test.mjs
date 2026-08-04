import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)

void test("package exports expose ESM without promising CommonJS", async () => {
  const retrocastIo = await import("@ischemist/retrocast-io")
  const routes = await import("@ischemist/routes")

  assert.equal(typeof retrocastIo.loadEvaluationBundleForImport, "function")
  assert.equal(typeof routes.projectRetrocastRoute, "function")
  assert.throws(() => require("@ischemist/retrocast-io"), {
    code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
  })
  assert.throws(() => require("@ischemist/routes"), {
    code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
  })
})
