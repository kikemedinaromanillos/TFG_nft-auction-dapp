// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnglishAuction is ReentrancyGuard, Ownable {
    address public seller;
    IERC721 public nft;
    uint256 public nftId;
    
    uint256 public highestBid;
    address public highestBidder;
    bool public auctionEnded;
    
    uint256 public auctionEndTime;
    uint256 public startingBid;
    uint256 public platformFee = 5; // Comisión del 5%
    address public platformWallet;

    mapping(address => uint256) public bids;

    event AuctionStarted(uint256 endTime);
    event BidPlaced(address indexed bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event PlatformFeeChanged(uint256 newFee);

    constructor(
        address _nft, 
        uint256 _nftId, 
        uint256 _startingBid, 
        uint256 _duration,
        address _platformWallet
    ) Ownable(msg.sender) {
        seller = msg.sender;
        nft = IERC721(_nft);
        nftId = _nftId;
        startingBid = _startingBid;
        auctionEndTime = block.timestamp + _duration;
        platformWallet = _platformWallet;

        emit AuctionStarted(auctionEndTime);
    }

    function bid() external payable nonReentrant {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        require(msg.value > highestBid, "Bid must be higher");

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        highestBid = msg.value;
        highestBidder = msg.sender;

        emit BidPlaced(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 amount = bids[msg.sender];
        require(amount > 0, "No funds to withdraw");

        bids[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function finalizeAuction() external nonReentrant {
        require(block.timestamp >= auctionEndTime, "Auction is still ongoing");
        require(!auctionEnded, "Auction already ended");

        auctionEnded = true;

        if (highestBidder != address(0)) {
            uint256 feeAmount = (highestBid * platformFee) / 100;
            uint256 sellerAmount = highestBid - feeAmount;

            nft.transferFrom(address(this), highestBidder, nftId);
            payable(seller).transfer(sellerAmount);
            payable(platformWallet).transfer(feeAmount);
        } else {
            nft.transferFrom(address(this), seller, nftId);
        }

        emit AuctionEnded(highestBidder, highestBid);
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 10, "Fee cannot exceed 10%");
        platformFee = newFee;
        emit PlatformFeeChanged(newFee);
    }
}
