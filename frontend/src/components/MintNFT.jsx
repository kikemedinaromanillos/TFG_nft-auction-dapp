import { useState } from "react";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import "../styles/MintNFT.css";

const MintNFT = () => {
  const { nftContract, account } = useWeb3();
  const { showSuccess, showError } = useToast();
  const [tokenURI, setTokenURI] = useState("");
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!tokenURI) return showWarning("Introduce un URI válido");

    try {
      setMinting(true);
      const price = await nftContract.mintPrice();
      const tx = await nftContract.mintNFT(tokenURI, { value: price });
      await tx.wait();
      showSuccess("NFT minteado correctamente");
      setTokenURI("");
    } catch (error) {
      console.error(error);
      showError("Error al mintear el NFT");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="mint-container">
      <h3>Mintear nuevo NFT</h3>
      <input
        type="text"
        placeholder="Token URI (ej: ipfs://...)"
        value={tokenURI}
        onChange={(e) => setTokenURI(e.target.value)}
      />
      <button onClick={handleMint} disabled={!account || minting}>
        {minting ? "Minteando..." : "Mintear NFT"}
      </button>
    </div>
  );
};

export default MintNFT;
