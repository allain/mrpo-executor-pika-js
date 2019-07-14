import os from "os"
import fs from "fs-extra"
import path from "path"
import Debug from "debug"
import resolveBuildPackage from "./resolve-build-package"
import extractExtenalDeps from "./extract-external-deps"

const debug = Debug("mrpo:js-pika")

const randomInt = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
const generateBuildPath = name =>
  path.resolve(os.tmpdir(), `${name}-${Date.now()}-${randomInt()}`)

export default async function buildProject(
  config,
  buildPath = generateBuildPath(config.name)
) {
  await fs.ensureDir(buildPath)
  const packageJsonPath = path.resolve(buildPath, "package.json")

  const entryPath = path.resolve(config.cwd, "src", "index.js")

  const packageJson = {
    name: config.name,
    version: config.version,
    main: path.resolve(buildPath, "src", "index.js"),
    "@pika/pack": {
      pipeline: [
        [
          resolveBuildPackage("@pika/plugin-standard-pkg"),
          { exclude: ["tests/**/*", "**/*.test.*", "**/*.json"] }
        ],
        [resolveBuildPackage("@pika/plugin-build-node")],
        [resolveBuildPackage("@pika/plugin-build-web")]
        // [resolveBuildPackage("@pika/plugin-build-types")]
      ]
    }
  }

  debug("extracting external dependencies")
  const dependencies = await extractExtenalDeps(entryPath)

  debug("extracted external deps", dependencies)
  if (dependencies.length) {
    packageJson.dependencies = dependencies.reduce(
      (deps, dep) => ({
        ...deps,
        [dep]: (config.dependencies && config.dependencies[dep]) || "*"
      }),
      {}
    )
  }

  await fs.ensureSymlink(
    path.resolve(config.cwd, "src"),
    path.resolve(buildPath, "src")
  )

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

  return buildPath
}
