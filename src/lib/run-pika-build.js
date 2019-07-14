import execa from "execa"
import fs from "fs-extra"
import path from "path"

import resolveBin from "../lib/resolve-bin"

const packBin = resolveBin("pack")
/**
 *
 * @param {string} buildPath
 * @param {string} distPath
 * @returns {import('execa').ExecaChildProcess}
 */
export default function runPikaBuild(buildPath, distPath) {
  const execution = execa(packBin, ["build", "--cwd", buildPath])
  execution.stdout.pipe(process.stdout)
  execution.stderr.pipe(process.stderr)

  execution.then(async () => {
    await fs.remove(distPath)
    await fs.move(path.resolve(buildPath, "pkg"), distPath)
  })

  return execution
}
