export default function resolveBin(name) {
  return require.resolve(`.bin/${name}`, { paths: [__dirname] })
}
