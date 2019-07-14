import executor from "../pkg/dist-node"

describe("executor", () => {
  it("should export commands", () => {
    expect(Object.keys(executor)).toEqual(["build", "deps", "dev"])
  })
})
