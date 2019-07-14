import fs from "fs-extra"
import path from "path"

import extractExternalDeps from "../lib/extract-external-deps"

export default async function deps(config) {
  const entryPath = path.resolve(config.cwd, "src", "index.js")
  const deps = await extractExternalDeps(entryPath)
  console.log(deps.join("\n"))
}
