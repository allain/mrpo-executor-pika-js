import path from "path"
import fs from "fs-extra"
import execa from "execa"
import Debug from "debug"
const debug = Debug("mrpo:javascript-pika-executor")

export default async function installNodeModules(buildPath, config) {
  debug("installing node modules")
  const pkg = JSON.parse(
    await fs.readFile(path.resolve(buildPath, "package.json"), "utf-8")
  )
  for (const dep of pkg.dependencies) {
    console.log("installing", dep)
    const installing = execa("npm", ["install", dep], { cwd: config.cwd })
    installing.stdout.pipe(process.stdout)
    installing.stderr.pipe(process.stderr)
    await installing
  }
}
