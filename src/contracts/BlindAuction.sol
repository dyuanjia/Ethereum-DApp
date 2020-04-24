pragma solidity ^0.6.1;

contract BlindAuction {
    // uint256 => 256 bits
    // 8 bytes nonce => 64 bits
    // max bid => 192 bits
    uint256 constant public MAX_BID = 2**192 - 1;
    bool public ended = false;
    
    string public name;
    string public description;
    address payable public owner;
    uint256 public minimumBid;
    uint256 public biddingEndTime;
    uint256 public revealEndTime;
    uint256 stageDuration = 2 hours; // for deployment
    //uint256 stageDuration = 5 minutes; // for presentation
    //uint256 stageDuration = 5; // for testing
    
    struct BlindBid {
        bytes32 hash;
        uint secret;
    }
    mapping (address => BlindBid) bids;
    address payable public highestBidder;
    
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
        address payable _owner,
        uint256 _minimum_bid) public {
            require(bytes(_name).length > 0, "name cannot be empty");
            require(bytes(_description).length > 0, "description cannot be empty");
            require(_minimum_bid < MAX_BID, "minimum bid cannot be higher than max bid amount");
            name = _name;
            description = _description;
            owner = _owner;
            minimumBid = _minimum_bid;
            biddingEndTime = now + stageDuration;
            revealEndTime = biddingEndTime + stageDuration;
            highestBidder = _owner;
    }
    
    function bid(bytes32 _hash) external onlyBefore(biddingEndTime, msg.sender) {
        BlindBid memory _bid = BlindBid(_hash, 0);
        bids[msg.sender] = _bid;
        emit Bid(msg.sender, _hash);
    }
    
    function getBid() external view returns(bytes32) {
        return bids[msg.sender].hash;
    }
    
    function withdraw() external onlyBefore(biddingEndTime, msg.sender) {
        require(bids[msg.sender].hash != 0, "you have not bidded");
        delete bids[msg.sender];
        emit Bid(msg.sender, 0);
    }
    
    function reveal(bytes8 _nonce) payable external 
        onlyBefore(revealEndTime, msg.sender)
        onlyAfter(biddingEndTime) {
            // checks
            require(bids[msg.sender].hash != 0, "you must have bidded during the bidding stage");
            require(msg.value > minimumBid, "your bid is not high enough");
            require(msg.value < MAX_BID, "bid exceeds max bid amount");
            require(bids[msg.sender].secret == 0, "bid already revealed");
            bytes32 hash = calculateHash(msg.value, _nonce);
            require(hash == bids[msg.sender].hash, "either bid amount or nonce is incorrect");
            // effects
            uint256 refund = bids[highestBidder].secret;
            address payable prevHighestBidder = highestBidder;
            minimumBid = msg.value;
            bids[msg.sender].secret = msg.value;
            highestBidder = msg.sender;
            // interactions
            emit Reveal(msg.sender, msg.value);
            if (prevHighestBidder != owner) {
                prevHighestBidder.transfer(refund);
            }
    }
    
    function endAuction() external onlyAfter(revealEndTime) {
        require(ended == false, "auction already ended");
        ended = true;
        if (highestBidder != owner) {
            emit AuctionEnded(highestBidder, minimumBid);
            owner.transfer(minimumBid);
        } else {
            emit AuctionEnded(owner, 0);
        }
    }
    
    function calculateHash(uint256 _secret, bytes8 _nonce) public pure returns(bytes32){
        require(_secret < MAX_BID, "bid exceeds max bid amount");
        bytes32 concat = bytes32(_secret << 64 | uint64(_nonce));
        return sha256(abi.encodePacked(concat));
    }

    function getStage() external view returns(uint) {
        uint _time = now;
        if (_time < biddingEndTime) {
            return 0;
        } else if (_time < revealEndTime) {
            return 1;
        } else if (ended) {
            return 3;
        } else {
            return 2;
        }
    }
    
    event Bid(
        address indexed _bidder,
        bytes32 _hash
    );
    
    event Reveal(
        address indexed _bidder,
        uint256 _value
    );
    
    event AuctionEnded(
        address indexed _bidder,
        uint256 _value
    );

}