const BlindAuction = artifacts.require("BlindAuction");
require("chai").use(require("chai-as-promised")).should();

contract(
  "BlindAuction",
  ([developer, itemOwner, bidder1, bidder2, bidder3]) => {
    let blindAuction;
    const name = "The Diamond";
    const desc =
      "You've heard the legend of the Diamond. A meteorite that was found by Genghis Khan. Carried at the head of his armies. Owned by murderous Kings, and tragic Queens. It may sound like a campfire ghost-story. Curses, legends... Madness, death.";
    // 0.01 ether
    const minBid = "10000000000000000";
    const stageDuration = 60 * 60 * 2;

    before(async () => {
      //developer deploys the contract
      blindAuction = await BlindAuction.new(name, desc, itemOwner, minBid);
    });

    describe("BlindAuction constructor", async () => {
      it("has a name", async () => {
        const _name = await blindAuction.name();
        assert.equal(_name, name);
      });
      it("has a description", async () => {
        const _desc = await blindAuction.description();
        assert.equal(_desc, desc);
      });
      it("has a owner", async () => {
        const _owner = await blindAuction.owner();
        assert.equal(_owner, itemOwner);
      });
      it("has a positive minimum bid", async () => {
        const _minBid = await blindAuction.minimumBid();
        assert.equal(_minBid, minBid);
        assert.isAtLeast(parseInt(_minBid, 10), 0);
      });
      it("has correct stage duration", async () => {
        let _biddingEndTime = await blindAuction.biddingEndTime();
        let _revealEndTime = await blindAuction.revealEndTime();
        const _duration =
          parseInt(_revealEndTime, 10) - parseInt(_biddingEndTime, 10);
        assert.equal(_duration, stageDuration);
      });
    });

    describe("Invalid constructor", async () => {
      it("must have a name", async () => {
        await BlindAuction.new("", desc, itemOwner, minBid).should.be.rejected;
      });
      it("must have a description", async () => {
        await BlindAuction.new(name, "", itemOwner, minBid).should.be.rejected;
      });
      it("must have a valid owner address", async () => {
        await BlindAuction.new(name, desc, itemOwner.slice(0, -1), minBid)
          .should.be.rejected;
      });
      it("will never have a negative minimum bid", async () => {
        const testAuction = await BlindAuction.new(name, desc, itemOwner, "-1");
        const _minBid = await testAuction.minimumBid();
        assert.isAtLeast(parseInt(_minBid, 10), 0);
      });
    });
  }
);
