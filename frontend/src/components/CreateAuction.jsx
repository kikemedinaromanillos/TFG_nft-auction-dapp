import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import { parseEther } from "ethers";
import "../styles/CreateAuction.css";

const CreateAuction = () => {
  const { tokenId: tokenIdParam } = useParams();
  const navigate = useNavigate();
  const { nftContract, auctionManagerContract, account } = useWeb3();
  const { showSuccess, showError, showWarning } = useToast();

  const [tokenId, setTokenId] = useState("");
  const [startingBid, setStartingBid] = useState("0.01");
  const [duration, setDuration] = useState("86400"); // 1 día por defecto
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenIdParam) setTokenId(tokenIdParam);
  }, [tokenIdParam]);

  const handleCreateAuction = async () => {
    if (!tokenId || !startingBid || !duration) {
      showWarning("Rellena todos los campos");
      return;
    }

    try {
      setLoading(true);

      const nftAddress = await nftContract.getAddress();
      const parsedBid = parseEther(startingBid);
      const parsedDuration = parseInt(duration);

      const isApproved = await nftContract.getApproved(tokenId);
      const managerAddress = await auctionManagerContract.getAddress();

      if (isApproved.toLowerCase() !== managerAddress.toLowerCase()) {
        showWarning("Este NFT no está aprobado para el gestor de subastas");
        setLoading(false);
        return;
      }

      const tx = await auctionManagerContract.createAuction(
        nftAddress,
        tokenId,
        parsedBid,
        parsedDuration
      );

      await tx.wait();
      showSuccess(`✅ Subasta creada para NFT #${tokenId}`);
      setTokenId("");
      navigate("/");
    } catch (err) {
      console.error("❌ Error al crear la subasta:", err);
      showError("Error al crear la subasta. Revisa consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auction-form">
      <h2>🛠 Crear Subasta</h2>
      <p>Completa los campos para subastar tu NFT. Asegúrate de haber aprobado el NFT antes.</p>

      {tokenIdParam && (
        <div className="readonly-field">
          <label>ID del NFT:</label>
          <p>{tokenId}</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Puja inicial (ETH)"
        value={startingBid}
        onChange={(e) => setStartingBid(e.target.value)}
      />

      <input
        type="number"
        placeholder="Duración en segundos (ej. 86400 = 1 día)"
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
