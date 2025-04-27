import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../Web3Context";
import EnglishAuctionABI from "../contracts/EnglishAuction.json";

const BidAuction = () => { 
  const { signer, account } = useWeb3();
  const [auctionAddress, setAuctionAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleBid = async () => {
    if (!signer) return alert("Please connect your wallet first");
    if (!auctionAddress || !amount) return alert("Please fill all fields");

    try {
      const auctionContract = new ethers.Contract(
        auctionAddress,
        EnglishAuctionABI.abi,
        signer
      );

      const tx = await auctionContract.bid({ value: ethers.parseEther(amount) });
      await tx.wait();

      setStatus("Bid placed successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Error placing bid");
    }
  };

  return (
    <div className="bid-auction">
      <h2>Place Your Bid</h2>
      <input
        type="text"
        placeholder="Enter auction address"
        value={auctionAddress}
        onChange={(e) => setAuctionAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter bid amount (in ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleBid} disabled={!account}>
        Place Bid
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default BidAuction;