const BlindAuction = artifacts.require("BlindAuction");

module.exports = function (deployer) {
  const name = "The Diamond";
  const desc =
    "You've heard the legend of the Diamond. A meteorite that was found by Genghis Khan. Carried at the head of his armies. Owned by murderous Kings, and tragic Queens. It may sound like a campfire ghost-story. Curses, legends... Madness, death.";
  const owner = "0xa2DdcBB02BaeDfacDB55E20C3d670448194e33d8";
  // 0.01 ether
  const minBid = "10000000000000000";
  deployer.deploy(BlindAuction, name, desc, owner, minBid);
};
