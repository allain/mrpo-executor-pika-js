import resolveFrom from "resolve-from"

export default function resolveBuildPackage(id) {
  return resolveFrom(id, import.meta.url)
}
