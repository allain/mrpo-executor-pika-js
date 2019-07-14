export default function resolveBuildPackage(id) {
  return require.resolve(id, { paths: [__dirname] })
}
