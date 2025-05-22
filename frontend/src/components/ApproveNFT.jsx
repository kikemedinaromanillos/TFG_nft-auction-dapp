import { useState } from "react";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import "../styles/ApproveNFT.css";

const ApproveNFT = () => {
  const { nftContract, auctionManagerContract, account } = useWeb3();
  const { showSuccess, showError, showWarning } = useToast();
  const [tokenId, setTokenId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!tokenId) return showWarning("Introduce un tokenId");

    try {
      setLoading(true);
      const auctionAddress = await auctionManagerContract.getAddress();
      const tx = await nftContract.approve(auctionAddress, tokenId);
      await tx.wait();
      showSuccess(`NFT #${tokenId} aprobado correctamente`);
    } catch (error) {
      console.error(error);
      showError("Error al aprobar el NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approve-container">
      <h3>Autorizar NFT para subasta</h3>
      <input
        type="number"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <button onClick={handleApprove} disabled={!account || loading}>
        {loading ? "Aprobando..." : "Aprobar NFT"}
      </button>
    </div>
  );
};

export default ApproveNFT;
