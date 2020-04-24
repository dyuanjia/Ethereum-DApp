const Payment = artifacts.require("Payment");
require("chai").use(require("chai-as-promised")).should();

contract("Payment", ([developer, itemOwner]) => {
  let payment;
  // 0.5 ether
  const FEE = "500000000000000000";

  before(async () => {
    //developer deploys the contract
    payment = await Payment.new();
  });

  describe("Payment constructor", async () => {
    it("has a owner", async () => {
      const _owner = await payment.owner();
      assert.equal(_owner, developer);
    });
  });

  describe("payments", async () => {
    it("allows owner to pay", async () => {
      await payment.pay({ from: developer, value: FEE });
    });
    it("allows others to pay", async () => {
      await payment.pay({ from: itemOwner, value: FEE });
    });
    it("prevents payments of incorrect fee", async () => {
      await payment.pay({ from: itemOwner, value: "10" }).should.be.rejected;
    });
    it("allows owner to withdraw", async () => {
      await payment.withdraw({ from: developer });
    });
    it("prevents others to withdraw", async () => {
      await payment.withdraw({ from: itemOwner }).should.be.rejected;
    });
  });
});
