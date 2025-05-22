// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AuctionManager is ReentrancyGuard {
    struct Auction {
        address seller;
        address nft;
        uint256 tokenId;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        uint256 startingBid;
        bool ended;
    }

    uint256 public auctionCount;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;

    uint256 public platformFee = 5; // 5%
    address public platformWallet;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, address indexed nft, uint256 tokenId);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 amount);

    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }

    function createAuction(
        address nft,
        uint256 tokenId,
        uint256 startingBid,
        uint256 duration
    ) external {
        require(duration >= 60, "Duration must be at least 1 minute");

        IERC721(nft).transferFrom(msg.sender, address(this), tokenId);

        auctions[auctionCount] = Auction({
            seller: msg.sender,
            nft: nft,
            tokenId: tokenId,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            startingBid: startingBid,
            ended: false
        });

        emit AuctionCreated(auctionCount, msg.sender, nft, tokenId);
        auctionCount++;
    }

    function bid(uint256 auctionId) external payable {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= auction.startingBid, "Bid below starting price");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            pendingReturns[auctionId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function withdraw(uint256 auctionId) external {
        uint256 amount = pendingReturns[auctionId][msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingReturns[auctionId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];

        require(block.timestamp >= auction.endTime, "Auction not yet ended");
        require(!auction.ended, "Already finalized");
        require(msg.sender == auction.seller, "Only seller can finalize");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            uint256 fee = (auction.highestBid * platformFee) / 100;
            uint256 sellerAmount = auction.highestBid - fee;

            IERC721(auction.nft).transferFrom(address(this), auction.highestBidder, auction.tokenId);
            payable(auction.seller).transfer(sellerAmount);
            payable(platformWallet).transfer(fee);
        } else {
            IERC721(auction.nft).transferFrom(address(this), auction.seller, auction.tokenId);
        }

        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
    }

    function setPlatformFee(uint256 newFee) external {
        require(msg.sender == platformWallet, "Not authorized");
        require(newFee <= 10, "Max fee is 10%");
        platformFee = newFee;
    }
}
