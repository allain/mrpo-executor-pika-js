import os from "os"
import fs from "fs-extra"
import { writeJsonFile, loadJsonFile } from "./fs-utils"
import path from "path"
import Debug from "debug"
import resolveBuildPackage from "./resolve-build-package"
import DepsCollector from "./DepsCollector"

const debug = Debug("mrpo:js-pika")

const randomInt = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
const generateBuildPath = () =>
  path.resolve(os.tmpdir(), `mrpo-pika-js-${Date.now()}-${randomInt()}`)

export default async function buildProject(
  config,
  buildPath = generateBuildPath()
) {
  const targetPackageJsonPath = path.resolve(config.cwd, "package.json")
  if (!(await fs.pathExists(targetPackageJsonPath))) {
    throw new Error(`package.json not found in project`)
  }

  if (!(await fs.pathExists(path.resolve(config.cwd, "src")))) {
    throw new Error("src directory not found in project")
  }

  if (!(await fs.pathExists(path.resolve(config.cwd, "src", "index.js")))) {
    throw new Error("src/index.js not found in project")
  }

  await fs.ensureDir(buildPath)

  const srcPkg = await loadJsonFile(targetPackageJsonPath)

  const packageJsonPath = path.resolve(buildPath, "package.json")

  const entryPath = srcPkg.main
    ? path.resolve(config.cwd, srcPkg.main)
    : path.resolve(config.cwd, "src", "index.js")

  const packageJson = {
    ...srcPkg,
    main: entryPath,
    "@pika/pack": {
      pipeline: [
        [
          resolveBuildPackage("@pika/plugin-standard-pkg"),
          { exclude: ["tests/**/*", "**/*.test.*", "**/*.json"] }
        ],
        [resolveBuildPackage("@pika/plugin-build-node")],
        [resolveBuildPackage("@pika/plugin-build-web")]
      ]
    }
  }

  await fs.ensureSymlink(
    path.resolve(config.cwd, "src"),
    path.resolve(buildPath, "src")
  )

  await writeJsonFile(packageJsonPath, packageJson)

  return buildPath
}
