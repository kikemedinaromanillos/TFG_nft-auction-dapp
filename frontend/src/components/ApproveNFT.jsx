import { useState } from "react";
import { useWeb3 } from "../Web3Context";

const ApproveNFT = () => {
  const { account, nftContract, auctionContract } = useWeb3();
  const [nftId, setNftId] = useState("");
  const [status, setStatus] = useState("");

  const handleApprove = async () => {
    if (!account || !nftContract || !auctionContract) {
      alert("Please connect your wallet first");
      return;
    }
    if (nftId === "") {
      alert("Please enter the NFT ID");
      return;
    }

    try {
      alert("MetaMask will ask you to approve the transaction...");

      const tx = await nftContract.approve(await auctionContract.getAddress(), nftId);
      await tx.wait();

      setStatus(`✅ NFT ID ${nftId} approved for auction!`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error approving NFT");
    }
  };

  return (
    <div className="card">
      <h2>Approve NFT for Auction</h2>
      <input
        type="text"
        placeholder="Enter NFT ID"
        value={nftId}
        onChange={(e) => setNftId(e.target.value)}
      />
      <button onClick={handleApprove} disabled={!account || !nftContract || !auctionContract}>
        Approve NFT
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default ApproveNFT;
