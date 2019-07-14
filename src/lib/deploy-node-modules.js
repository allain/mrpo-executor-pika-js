import path from "path"
import fs from "fs-extra"
import execa from "execa"
import Debug from "debug"
const debug = Debug("mrpo:javascript-pika-executor")

export default async function deployNodeModules(buildPath, config) {
  debug("installing node modules")
  const installing = execa("npm", ["install", "--save"], { cwd: buildPath })
  installing.stdout.pipe(process.stdout)
  installing.stderr.pipe(process.stderr)
  await installing

  const targetNodeModules = path.resolve(config.cwd, "node_modules")
  if (await fs.pathExists(targetNodeModules)) {
    await fs.remove(targetNodeModules)
  }
  await fs.move(
    path.resolve(buildPath, "node_modules"),
    path.resolve(config.cwd, "node_modules")
  )
}
