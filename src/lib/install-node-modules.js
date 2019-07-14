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
  await fs.ensureDir(path.resolve(config.cwd, "node_modules"))

  for (const [name, version] of Object.entries(pkg.dependencies || {})) {
    try {
      require.resolve(`${name}`, { paths: [config.cwd] })
    } catch (err) {
      console.log("installing", `${name}@${version}`)
      const installing = execa("npm", ["install", `${name}@${version}`], {
        cwd: config.cwd
      })
      installing.stdout.pipe(process.stdout)
      installing.stderr.pipe(process.stderr)
      await installing
    }
  }
}
