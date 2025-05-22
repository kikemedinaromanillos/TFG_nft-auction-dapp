import { useState } from "react";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import { parseEther } from "ethers";
import "../styles/CreateAuction.css";

const CreateAuction = () => {
  const { nftContract, auctionManagerContract, account } = useWeb3();
  const { showSuccess, showError, showWarning } = useToast();
  const [tokenId, setTokenId] = useState("");
  const [startingBid, setStartingBid] = useState("0.01");
  const [duration, setDuration] = useState("86400");
  const [loading, setLoading] = useState(false);

  const handleCreateAuction = async () => {
    if (!tokenId || !startingBid || !duration) return showWarning("Rellena todos los campos");

    try {
      setLoading(true);
      const tx = await auctionManagerContract.createAuction(
        await nftContract.getAddress(),
        tokenId,
        parseEther(startingBid),
        parseInt(duration)
      );
      await tx.wait();
      showSuccess(`Subasta creada para NFT #${tokenId}`);
      setTokenId("");
    } catch (err) {
      console.error(err);
      showError("Error al crear la subasta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auction-container">
      <h3>Crear Subasta</h3>
      <input
        type="number"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Puja inicial (ETH)"
        value={startingBid}
        onChange={(e) => setStartingBid(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duración en segundos"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <button onClick={handleCreateAuction} disabled={!account || loading}>
        {loading ? "Creando..." : "Crear Subasta"}
      </button>
    </div>
  );
};

export default CreateAuction;
