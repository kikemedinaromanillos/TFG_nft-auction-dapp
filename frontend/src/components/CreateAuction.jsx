import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../Web3Context";
import NFTCollectionABI from "../contracts/NFTCollection.json";
import EnglishAuctionABI from "../contracts/EnglishAuction.json";


const NFT_CONTRACT_ADDRESS = "0xYourNFTContractAddress"; // Replace with your NFT contract address

const CreateAuction = () => {
  const { signer, account } = useWeb3();
  const [tokenId, setTokenId] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [duration, setDuration] = useState("86400"); // por defecto 1 día
  const [status, setStatus] = useState("");

  const handleCreateAuction = async () => {
    if (!signer) return alert("Please connect your wallet first");
    if (!tokenId || !startingBid || !duration) return alert("Please fill all fields");

    try {
      const AuctionFactory = new ethers.ContractFactory(
        EnglishAuctionABI.abi,
        EnglishAuctionABI.bytecode,
        signer
      );

      const auction = await AuctionFactory.deploy(
        NFT_CONTRACT_ADDRESS,
        tokenId,
        ethers.parseEther(startingBid),
        Number(duration),
        account // plataforma cobra comision
      );
      await auction.waitForDeployment();

      const auctionAddress = await auction.getAddress();
        setStatus("Auction created successfully!");
    } catch (err) {
      console.error(err);
        setStatus("Error creating auction");
    }
  };

  return (
    <div className="create-auction">
      <h2>Create Your Auction</h2>
      <input
        type="text"
        placeholder="Enter token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Starting bid (in ETH)"
        value={startingBid}
        onChange={(e) => setStartingBid(e.target.value)}
      />
      <input
        type="text"
        placeholder="Duration (in seconds)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <button onClick={handleCreateAuction} disabled={!account}>
        Create Auction
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default CreateAuction;
