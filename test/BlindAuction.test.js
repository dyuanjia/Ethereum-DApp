const BlindAuction = artifacts.require("BlindAuction");
require("chai").use(require("chai-as-promised")).should();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

contract(
  "BlindAuction",
  ([developer, itemOwner, bidder1, bidder2, bidder3]) => {
    let blindAuction;
    const name = "The Diamond";
    const desc =
      "You've heard the legend of the Diamond. A meteorite that was found by Genghis Khan. Carried at the head of his armies. Owned by murderous Kings, and tragic Queens. It may sound like a campfire ghost-story. Curses, legends... Madness, death.";
    // 0.01 ether
    const minBid = "10000000000000000";
    const stageDuration = 5;
    // Sample bids
    const secret1 = "1000000000000000000";
    const nonce1 = "0xdeadbeefdeadbeef";
    const hash1 =
      "0x65d912dee76723f0b8e3363c0f11ebf449ff0c197fef2d411eb16c5e25cb31dc";
    const secret2 = "2000000000000000000";
    const nonce2 = "0xdeeeeeeeeeeeeead";
    const hash2 =
      "0xd188281046ff2af1b399c05a759153b2e60a7d8a9fb72f5698eacfbe5bdd6192";
    const secret3 = "3000000000000000000";
    const nonce3 = "0xbeeeeeeeeeeeeeef";
    const hash3 =
      "0x7c07e417a147083a3cae9a061341ce516d54b649a4697045ada50363cb3495ea";
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
      it("set the minimum bid as the default highest bid", async () => {
        const _highestBid = await blindAuction.highestBid();
        assert.equal(_highestBid, minBid);
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
        const response = await blindAuction.bid(hash2, {
          from: bidder1,
        });
        const event = response.logs[0].args;
        assert.equal(event._bidder, bidder1);
        assert.equal(event._hash, hash2);
      });
      it("allows a bidder to change his bid", async () => {
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

    describe("Revealing Stage", async () => {
      let stage;
      before(async () => {
        await blindAuction.bid(hash1, { from: bidder1 });
        await blindAuction.bid(hash2, { from: bidder2 });
        await blindAuction.bid(hash3, { from: bidder3 });
        console.log("Sleeping until revealing stage...");
        await sleep(stageDuration * 1000);
      });

      it("prevents owner from revealing", async () => {
        await blindAuction.reveal(nonce1, { from: itemOwner, value: secret1 })
          .should.be.rejected;
      });
      it("prevents someone who didn't bid during the bidding stage from revealing", async () => {
        await blindAuction.reveal(nonce1, { from: developer, value: secret1 })
          .should.be.rejected;
      });
      it("no longer allow a bidder to bid or change his bid", async () => {
        await blindAuction.bid(hash2, { from: bidder1 }).should.be.rejected;
      });
      it("no longer allow a bidder to withdraw", async () => {
        await blindAuction.withdraw({ from: bidder1 }).should.be.rejected;
      });
      it("still allows a bidder to retrieve his bid with getBid()", async () => {
        const bid = await blindAuction.getBid({ from: bidder1 });
        assert.equal(bid, hash1);
      });
      it("allows a bidder to reveal his bid and emits a Reveal event", async () => {
        const response = await blindAuction.reveal(nonce2, {
          from: bidder2,
          value: secret2,
        });
        const event = response.logs[0].args;
        assert.equal(event._bidder, bidder2);
        assert.equal(event._value, secret2);
      });
      it("prevents a bidder from revealing again", async () => {
        await blindAuction.reveal(nonce2, {
          from: bidder2,
          value: secret2,
        }).should.be.rejected;
      });
      it("prevents a bidder from revealing with a bid amount that's not higher than the current highest bid", async () => {
        await blindAuction.bid(nonce1, {
          from: bidder1,
          value: secret1,
        }).should.be.rejected;
      });
      it("prevents a bidder from revealing with a wrong bid amount", async () => {
        await blindAuction.reveal(nonce3, {
          from: bidder3,
          value: secret2,
        }).should.be.rejected;
      });
      it("prevents a bidder from revealing with a wrong nonce", async () => {
        await blindAuction.reveal(nonce2, {
          from: bidder3,
          value: secret3,
        }).should.be.rejected;
      });
      it("allows a bidder with a higher bid amount to replace the current highest bidder, and refund the current highest bidder his bid amount", async () => {
        const beforeBalance = await web3.eth.getBalance(bidder2);
        const response = await blindAuction.reveal(nonce3, {
          from: bidder3,
          value: secret3,
        });
        const event = response.logs[0].args;
        assert.equal(event._bidder, bidder3);
        assert.equal(event._value, secret3);
        const newHighestBidder = await blindAuction.highestBidder();
        assert.equal(newHighestBidder, bidder3);
        const newHighestBid = await blindAuction.highestBid();
        assert.equal(newHighestBid, secret3);
        const afterBalance = await web3.eth.getBalance(bidder2);
        assert.equal(afterBalance - beforeBalance, secret2);
      });
      it("allows endAuction() be called after the revealing stage, and transfer the highest bid to the item owner", async () => {
        console.log("Sleeping until revealing stage ends...");
        await sleep((stageDuration + 1) * 1000);
        let ended = await blindAuction.ended();
        assert.isFalse(ended);
        const beforeBalance = await web3.eth.getBalance(itemOwner);
        // end the auction
        const response = await blindAuction.endAuction();
        const event = response.logs[0].args;
        assert.equal(event._bidder, bidder3);
        assert.equal(event._value, secret3);
        ended = await blindAuction.ended();
        assert.isTrue(ended);
        const afterBalance = await web3.eth.getBalance(itemOwner);
        assert.equal(afterBalance - beforeBalance, secret3);
      });
      it("prevents endAuction() from being called again", async () => {
        await blindAuction.endAuction().should.be.rejected;
      });
    });

    describe("An Auction without valid bidders", async () => {
      before(async () => {
        blindAuction = await BlindAuction.new(name, desc, itemOwner, minBid);
        console.log("Sleeping until revealing stage ends...");
        await sleep((stageDuration + 1) * 1000 * 2);
      });

      it("ends the auction without making any transfers and emits AuctionEnded event containing the item owner and a value of 0", async () => {
        const beforeBalance = await web3.eth.getBalance(itemOwner);
        const response = await blindAuction.endAuction();
        const event = response.logs[0].args;
        assert.equal(event._bidder, itemOwner);
        assert.equal(event._value, 0);
        const ended = await blindAuction.ended();
        assert.isTrue(ended);
        const afterBalance = await web3.eth.getBalance(itemOwner);
        assert.equal(beforeBalance, afterBalance);
        const highestBid = await blindAuction.highestBid();
        assert.equal(highestBid, minBid);
      });
    });
  }
);
