import resolveFrom from "resolve-from"

export default function resolveBin(name) {
  return resolveFrom(`.bin/${name}`, __dirname)
}
