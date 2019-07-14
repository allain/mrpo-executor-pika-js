import execa from "execa"
import fs from "fs-extra"
import path from "path"
import Debug from "debug"
import chokidar from "chokidar"

import buildProject from "../lib/build-project"
import runPikaBuild from "../lib/run-pika-build"
import DepsCollector from "../lib/DepsCollector"
import installNodeModules from "../lib/install-node-modules"

const debug = Debug("mrpo:javacsript-pika-executor")

export default {
  stopper: null,

  /** @type {import('execa').ExecaChildPromise} */
  buildingProcess: null,

  async start(config) {
    debug("generating build source")
    const buildPath = await buildProject(config)
    const distPath = path.resolve(config.cwd, "dist")
    debug("generated at %s", buildPath)

    const collector = new DepsCollector()
    await collector.updateFile(path.resolve(config.cwd, "src", "index.js"))

    console.log("detected dependencies", collector.dependencies)
    const watcher = chokidar.watch(path.resolve(config.cwd, "src"))
    console.log("performing initial build")
    await build()

    console.log("listening for changes")

    watcher.on("change", async changedPath => {
      if (await collector.updateFile(changedPath)) {
        console.log("new external deps")
        const buildPath = await buildProject(config)
        await installNodeModules(buildPath, config)
      }

      if (this.buildingProcess) {
        this.buildingProcess.cancel()
      }
      build()
    })

    async function build() {
      const execution = (this.buildProcess = runPikaBuild(buildPath, distPath))

      execution.on("exit", () => {
        this.buildingProcess = null
      })

      await execution
    }

    await new Promise(resolve => (this.stopper = resolve))

    watcher.close()
  },

  async stop() {
    if (this.buildingProcess) {
      this.buildingProcess.cancel()
      this.buildingProcess = null
    }

    if (this.stopper) {
      this.stopper()
      this.stopper = null
    }
  }
}
