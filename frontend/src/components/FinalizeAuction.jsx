import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import { ethers } from "ethers";
import "../styles/FinalizeAuction.css";

const FinalizeAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auctionManagerContract, nftContract, account } = useWeb3();
  const { showSuccess, showError } = useToast();

  const [auction, setAuction] = useState(null);
  const [tokenURI, setTokenURI] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBlockTime, setCurrentBlockTime] = useState(null);

  const fetchAuction = async () => {
    try {
      const data = await auctionManagerContract.auctions(id);
      const uri = await nftContract.tokenURI(data.tokenId);
      setAuction(data);
      setTokenURI(uri);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const block = await provider.getBlock("latest");
      setCurrentBlockTime(block.timestamp);
    } catch (err) {
      console.error("❌ Error al cargar la subasta", err);
      showError("Error al cargar la subasta");
    }
  };

  const handleFinalize = async () => {
    try {
      setLoading(true);
      const tx = await auctionManagerContract.finalizeAuction(id);
      await tx.wait();
      showSuccess("✅ Subasta finalizada correctamente");

      setTimeout(() => {
        navigate("/my-auctions");
      }, 1500);
    } catch (err) {
      console.error(err);
      showError("❌ Error al finalizar la subasta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionManagerContract && nftContract) {
      fetchAuction();
    }
  }, [id, auctionManagerContract, nftContract]);

  if (!auction || currentBlockTime === null) return <p>Cargando subasta...</p>;

  const canFinalize =
    account?.toLowerCase() === auction.seller.toLowerCase() &&
    currentBlockTime >= Number(auction.endTime) &&
    !auction.ended;

  const formattedEnd = new Date(Number(auction.endTime) * 1000).toLocaleString();

  return (
    <div className="finalize-container">
      <h2>🛠 Finalizar Subasta #{id}</h2>

      {tokenURI.startsWith("ipfs://") ? (
        <img
          src={tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
          alt={`NFT #${auction.tokenId}`}
        />
      ) : (
        <div className="placeholder-img">Imagen local</div>
      )}

      <p><strong>NFT #{auction.tokenId}</strong></p>
      <p><strong>Finaliza:</strong> {formattedEnd}</p>
      <p><strong>Estado:</strong> {auction.ended ? "✅ Finalizada" : "⏳ Activa"}</p>

      {auction.ended ? (
        <p className="finalized-status">✅ Subasta finalizada</p>
      ) : canFinalize ? (
        <button onClick={handleFinalize} disabled={loading}>
          {loading ? "Finalizando..." : "Finalizar Subasta"}
        </button>
      ) : (
        <p className="note">Solo el vendedor puede finalizar la subasta una vez haya terminado.</p>
      )}
    </div>
  );
};

export default FinalizeAuction;
