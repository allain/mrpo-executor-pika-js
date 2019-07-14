import resolveFrom from "resolve-from"

export default function resolveBuildPackage(id) {
  return resolveFrom(id, __dirname)
}
