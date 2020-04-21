const BlindAuction = artifacts.require("BlindAuction");
require("chai").use(require("chai-as-promised")).should();

contract("BlindAuction", (accounts) => {
  let blindAuction;
  before(async () => {
    blindAuction = await BlindAuction.new();
  });
  describe("BlindAuction Deployment", async () => {
    it("has a name", async () => {
      const name = await blindAuction.name();
      assert.equal(name, "Blind Auction");
    });
  });
});
