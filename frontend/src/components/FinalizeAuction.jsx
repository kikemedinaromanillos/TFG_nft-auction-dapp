import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import "../styles/FinalizeAuction.css";

const FinalizeAuction = () => {
  const { id } = useParams();
  const { auctionManagerContract, nftContract, account } = useWeb3();
  const [auction, setAuction] = useState(null);
  const [tokenURI, setTokenURI] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAuction = async () => {
    try {
      const data = await auctionManagerContract.auctions(id);
      const uri = await nftContract.tokenURI(data.tokenId);
      setAuction(data);
      setTokenURI(uri);
    } catch (err) {
      console.error("Error al cargar la subasta", err);
    }
  };

  const handleFinalize = async () => {
    try {
      setLoading(true);
      const tx = await auctionManagerContract.finalizeAuction(id);
      await tx.wait();
      showSuccess("Subasta finalizada correctamente");
      fetchAuction();
    } catch (err) {
      console.error(err);
      showError("Error al finalizar la subasta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionManagerContract && nftContract) {
      fetchAuction();
    }
  }, [id, auctionManagerContract, nftContract]);

  if (!auction) return <p>Cargando subasta...</p>;

  const currentTime = Math.floor(Date.now() / 1000);
  const canFinalize =
    account?.toLowerCase() === auction.seller.toLowerCase() &&
    currentTime >= Number(auction.endTime) &&
    !auction.ended;

  return (
    <div className="finalize-container">
      <h2>Finalizar Subasta #{id}</h2>

      <img
        src={tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
        alt={`NFT #${auction.tokenId}`}
      />

      <p><strong>NFT #{auction.tokenId}</strong></p>
      <p><strong>Finaliza:</strong> {new Date(Number(auction.endTime) * 1000).toLocaleString()}</p>
      <p><strong>Estado:</strong> {auction.ended ? "Finalizada ✅" : "Activa ⏳"}</p>

      {auction.ended ? (
        <p className="finalized-status">✅ Subasta finalizada</p>
      ) : canFinalize ? (
        <button onClick={handleFinalize} disabled={loading}>
          {loading ? "Finalizando..." : "Finalizar Subasta"}
        </button>
      ) : (
        <p className="note">Solo el vendedor puede finalizar la subasta una vez haya terminado.</p>
      )}

      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default FinalizeAuction;
