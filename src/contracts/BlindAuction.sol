pragma solidity ^0.6.1;

contract BlindAuction {
    string public name;
    string public description;
    address public owner;
    uint256 public minimumBid;
    uint256 public biddingEndTime;
    uint256 public revealEndTime;
    uint256 stageDuration = 2 hours;
    
    struct BlindBid {
        bytes32 hash;
        uint secret;
    }
    mapping (address => BlindBid) bids;
    
    modifier onlyBefore(uint _time, address _sender) { 
        require(now < _time);
        require(_sender != owner, "owner cannot participate in the auction");
        _;
    }
    modifier onlyAfter(uint _time) { 
        require(now > _time); 
        _;
    }
    
    constructor(
        string memory _name,
        string memory _description,
        address _owner,
        uint256 _minimum_bid) public {
            require(bytes(_name).length > 0, "name cannot be empty");
            require(bytes(_description).length > 0, "description cannot be empty");
            name = _name;
            description = _description;
            owner = _owner;
            minimumBid = _minimum_bid;
            biddingEndTime = now + stageDuration;
            revealEndTime = biddingEndTime + stageDuration;
    }
    
    function bid(bytes32 _hash) external onlyBefore(biddingEndTime, msg.sender) {
        BlindBid memory _bid = BlindBid(_hash, 0);
        bids[msg.sender] = _bid;
        emit Bid(msg.sender, _hash);
    }
    
    function withdraw() external onlyBefore(biddingEndTime, msg.sender) {
        delete bids[msg.sender];
        emit Bid(msg.sender, 0);
    }

    
    function calculateHash(uint secret) public pure returns(bytes32){
        bytes memory b = new bytes(32);
        assembly { mstore(add(b, 32), secret) }
        return sha256(b);
    }
    
    event Bid(
        address indexed _bidder,
        bytes32 _hash
    );

}