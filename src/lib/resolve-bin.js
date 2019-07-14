import resolveFrom from "resolve-from"

export default function resolveBin(name) {
  return resolveFrom(`.bin/${name}`, import.meta.url)
}
