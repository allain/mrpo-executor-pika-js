import execa from "execa"
import fs from "fs-extra"
import path from "path"
import Debug from "debug"
import runPikaBuild from "../lib/run-pika-build"
import buildProject from "../lib/build-project"
import installNodeModules from "../lib/install-node-modules"

const debug = Debug("mrpo:executor-pika-js")

export default {
  /** @type {import('execa').ExecaChildPromise} */
  execution: null,
  async start(config) {
    debug("generating build source")
    const buildPath = await buildProject(config)
    debug("generated at %s", buildPath)

    debug("deploying node_modules")
    await installNodeModules(buildPath, config)
    debug("done")

    const execution = runPikaBuild(buildPath, path.resolve(config.cwd, "dist"))
    execution.on("exit", () => {
      this.execution = null
    })
    await execution

    if (config.keep) {
      debug("keeping build project")
    } else {
      debug("destroying build project")
      // await fs.remove(buildPath)
    }
  },

  async stop() {
    if (this.execution) {
      this.execution.cancel()
      this.execution = null
    }
  }
}
