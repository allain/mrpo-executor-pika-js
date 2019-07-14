import DepsCollector from "./DepsCollector"

export default async function extractExternalDeps(rootPath) {
  const collector = new DepsCollector()
  await collector.updateFile(rootPath)
  return collector.dependencies
}
