import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../Web3Context";
import NFTCollectionABI from "../contracts/NFTCollection.json";

const NFT_CONTRACT_ADDRESS = "0xYourNFTContractAddress"; // Replace with your NFT contract address

const TransferNFT = () => {
    const { signer, account } = useWeb3();
    const [auctionAddress, setAuctionAddress] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [status, setStatus] = useState("");
    
    const handleTransfer = async () => { 
        if (!signer) return alert("Please connect your wallet first");
        if (!auctionAddress || !tokenId) return alert("Please fill all fields");

        try {
            const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTCollectionABI.abi, signer);
            const tx = await contract.transferFrom(account, auctionAddress, tokenId);
            await tx.wait();

            setStatus("NFT transferred successfully!");
        } catch (err) {
            console.error(err);
            setStatus("Error transferring NFT");
        }
    }
    return (
        <div className="transfer-nft">
            <h2>Transfer Your NFT to Auction</h2>
            <input
                type="text"
                placeholder="Enter auction address"
                value={auctionAddress}
                onChange={(e) => setAuctionAddress(e.target.value)}
            />
            <input
                type="text"
                placeholder="Enter token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
            />
            <button onClick={handleTransfer} disabled={!account}>
                Transfer NFT
            </button>
            {status && <p>{status}</p>}
        </div>
    );
}
export default TransferNFT;