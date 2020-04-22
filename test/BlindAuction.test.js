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
    const stageDuration = 10;
    // Sample bids
    const secret1 = "1000000000000000000";
    const nonce1 = "0xdeadbeefdeadbeef";
    const hash1 =
      "0x65d912dee76723f0b8e3363c0f11ebf449ff0c197fef2d411eb16c5e25cb31dc";
    // Invalid variables
    const tooHighBid = (2 ** 219).toString();

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
      it("set the owner as the default highest bidder", async () => {
        const _highestBidder = await blindAuction.highestBidder();
        assert.equal(_highestBidder, itemOwner);
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
        await BlindAuction.new(name, desc, itemOwner, "-1").should.be.rejected;
      });
      it("must have minimum bid lower than the maximum bid amount", async () => {
        await BlindAuction.new(name, desc, itemOwner, tooHighBid).should.be
          .rejected;
      });
    });

    describe("Function calculateHash(uint256 _secret, bytes8 _nonce)", async () => {
      it("calculates the hash correctly", async () => {
        const _hash = await blindAuction.calculateHash(secret1, nonce1);
        assert.equal(_hash, hash1);
      });
      it("must have a value lower than the maximum bid amount", async () => {
        await blindAuction.calculateHash(tooHighBid, nonce1).should.be.rejected;
      });
      it("must have a valid 8 byte nonce", async () => {
        await blindAuction.calculateHash(secret1, "invalid").should.be.rejected;
      });
    });

    describe("Bidding Stage", async () => {
      it("prevents owner from bidding", async () => {
        await blindAuction.bid(hash1, { from: itemOwner }).should.be.rejected;
      });
      it("allows a bidder to bid and emits a Bid event", async () => {
        const response = await blindAuction.bid(hash1, {
          from: bidder1,
        });
        const event = response.logs[0].args;
        assert.equal(event._bidder, bidder1);
        assert.equal(event._hash, hash1);
      });
      it("must bid with a valid hash", async () => {
        await blindAuction.bid("invalid", {
          from: bidder1,
        }).should.be.rejected;
      });
      it("allows a bidder to retrieve his bid with getBid()", async () => {
        const bid = await blindAuction.getBid({ from: bidder1 });
        assert.equal(bid, hash1);
      });
      it("allows a bidder to withdraw, i.e. set his bid to 0", async () => {
        const response = await blindAuction.withdraw({ from: bidder1 });
        const event = response.logs[0].args;
        assert.equal(event._bidder, bidder1);
        assert.equal(event._hash, 0);
      });
      it("prevents a bidder to reveal in this stage", async () => {
        await blindAuction.reveal(nonce1, { from: bidder1 }).should.be.rejected;
      });
      it("prevents anyone from ending the auction in this stage", async () => {
        await blindAuction.endAuction({ from: bidder1 }).should.be.rejected;
      });
    });
  }
);
