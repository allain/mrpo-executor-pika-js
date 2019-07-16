import path from "path"
import fs from "fs-extra"
import precinct from "precinct"

/**
 *
 * @param {Set} a
 * @param {Set} b
 */
function sameSet(a, b) {
  if (a.size !== b.size) return false
  for (const inA of a) {
    if (!b.has(inA)) return false
  }
  return true
}

export default class DepsCollector {
  constructor() {
    this.externals = new Set()
    this.depsMap = {}
    this.fileDeps = {}
  }

  async updateFile(srcFile) {
    const srcFiles = [srcFile]

    let changed = false

    while (srcFiles.length) {
      const srcFile = srcFiles.pop()

      const fileDeps = precinct(await fs.readFile(srcFile, "utf-8")).reduce(
        (newDeps, dep) => {
          if (dep.match(/^[./]/)) {
            // dep is to a path
            const depPath = path.resolve(path.dirname(srcFile), dep)
            newDeps.internal.add(depPath)
          } else {
            if (dep[0] === "@") {
              // scoped dep
              const [scope, name] = dep.split("/", 3)
              dep = `${scope}/${name}`
            } else {
              const [name] = dep.split("/", 2)
              dep = name
            }
            newDeps.external.add(dep)
            // dep is to something external
          }
          return newDeps
        },
        { external: new Set(), internal: new Set() }
      )

      const oldDeps = this.fileDeps[srcFile]
      this.fileDeps[srcFile] = fileDeps

      if (oldDeps) {
        if (
          !sameSet(oldDeps.internal, fileDeps.internal) ||
          !sameSet(oldDeps.external, fileDeps.external)
        ) {
          changed = true
        }
      } else {
        changed = true
        for (const internal of fileDeps.internal) {
          srcFiles.push(internal)
        }
      }
    }

    return changed
  }

  get dependencies() {
    const externals = new Set()
    for (const { external } of Object.values(this.fileDeps)) {
      for (const dep of external) {
        externals.add(dep)
      }
    }

    return [...externals].sort()
  }

  static async collectFrom(entryPath) {
    const collector = new DepsCollector()
    await collector.updateFile(entryPath)
    return collector.dependencies
  }
}
