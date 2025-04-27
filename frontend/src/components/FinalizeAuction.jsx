import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../Web3Context";
import EnglishAuctionABI from "../contracts/EnglishAuction.json";

const FinalizeAuction = () => {
    const { signer, account } = useWeb3();
    const [auctionAddress, setAuctionAddress] = useState("");
    const [status, setStatus] = useState("");
    
    const handleFinalize = async () => {
        if (!signer) return alert("Please connect your wallet first");
        if (!auctionAddress) return alert("Please fill the auction address");
    
        try {
        const auctionContract = new ethers.Contract(
            auctionAddress,
            EnglishAuctionABI.abi,
            signer
        );
    
        const tx = await auctionContract.finalizeAuction();
        await tx.wait();
    
        setStatus("Auction finalized successfully!");
        } catch (err) {
        console.error(err);
        setStatus("Error finalizing auction");
        }
    };
    
    return (
        <div className="finalize-auction">
        <h2>Finalize Auction</h2>
        <input
            type="text"
            placeholder="Enter auction address"
            value={auctionAddress}
            onChange={(e) => setAuctionAddress(e.target.value)}
        />
        <button onClick={handleFinalize} disabled={!account}>
            Finalize Auction
        </button>
        {status && <p>{status}</p>}
        </div>
    );
}
export default FinalizeAuction;