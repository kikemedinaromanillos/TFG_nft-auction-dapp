import { useState } from "react";
import { useWeb3 } from "../Web3Context";

const MintNFT = () => {
  const { account, nftContract } = useWeb3();
  const [tokenURI, setTokenURI] = useState("");
  const [status, setStatus] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState(null);

  const handleMint = async () => {
    if (!account || !nftContract) {
      alert("Please connect your wallet first");
      return;
    }
    if (!tokenURI) {
      alert("Please enter a token URI");
      return;
    }

    try {
      const mintPrice = await nftContract.mintPrice();
      const tx = await nftContract.mintNFT(tokenURI, { value: mintPrice });
      const receipt = await tx.wait();

      // 🛰️ Buscar el evento Transfer en el receipt
      const transferEvent = receipt.logs
        .map(log => {
          try {
            return nftContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter(log => log && log.name === "Transfer")[0];

      if (transferEvent) {
        const tokenId = transferEvent.args.tokenId.toString();
        setMintedTokenId(tokenId);
        console.log("✅ NFT minted with ID:", tokenId);
        setStatus(`✅ NFT minted successfully! Token ID: ${tokenId}`);
      } else {
        setStatus("✅ NFT minted, but could not detect Token ID");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Error minting NFT");
    }
  };

  return (
    <div className="card">
      <h2>Mint Your NFT</h2>
      <input
        type="text"
        placeholder="Enter token URI (ipfs://...)"
        value={tokenURI}
        onChange={(e) => setTokenURI(e.target.value)}
      />
      <button onClick={handleMint} disabled={!account || !nftContract}>
        Mint NFT
      </button>

      {status && <p>{status}</p>}

      {mintedTokenId !== null && (
        <div>
          <strong>New NFT ID:</strong> {mintedTokenId}
        </div>
      )}
    </div>
  );
};

export default MintNFT;
