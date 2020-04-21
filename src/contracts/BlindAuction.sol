pragma solidity ^0.6.1;

contract BlindAuction {
    address public owner;
    uint private number;
    string public name = "Blind Auction";
    
    constructor() public {
        owner = msg.sender;
    }
    
    function setNumber(uint _number) public {
        number = _number;
    }

    function getNumber() view public returns(uint) {
        return(number);
    }

}