pragma solidity ^0.6.1;

contract Payment {
    uint constant public FEE = 500000000000000000; // 0.5 ether
    
    address payable public owner;

    constructor() public {
        owner = msg.sender;
    }
    
    function pay() external payable {
        require(msg.value==FEE, "incorrect fee");
    }
    
    function withdraw() external {
        require(msg.sender==owner, "only owner can withdraw");
        owner.transfer(FEE);
    }

}