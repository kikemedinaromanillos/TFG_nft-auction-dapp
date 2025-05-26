import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3Context";
import CountdownTimer from "./CountdownTimer";

import "../styles/MyAuctions.css";

const MyAuctions = () => {
  const { auctionManagerContract, nftContract, account } = useWeb3();
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [finishedAuctions, setFinishedAuctions] = useState([]);

  const fetchMyAuctions = async () => {
    try {
      const count = await auctionManagerContract.auctionCount();
      const active = [];
      const finished = [];

      for (let i = 0; i < count; i++) {
        const auction = await auctionManagerContract.auctions(i);

        if (auction.seller.toLowerCase() === account.toLowerCase()) {
          const tokenId = Number(auction.tokenId);
          const highestBid = Number(auction.highestBid);
          const endTime = Number(auction.endTime);
          const tokenURI = await nftContract.tokenURI(tokenId);

          const metadataUrl = tokenURI.startsWith("ipfs://")
            ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            : tokenURI;

          const res = await fetch(metadataUrl);
          const metadata = await res.json();

          const auctionData = {
            id: i,
            tokenId,
            highestBid,
            endTime,
            ended: auction.ended,
            seller: auction.seller,
            highestBidder: auction.highestBidder,
            tokenURI,
            metadata
          };

          if (auction.ended) {
            finished.push(auctionData);
          } else {
            active.push(auctionData);
          }
        }
      }

      setActiveAuctions(active);
      setFinishedAuctions(finished);
    } catch (err) {
      console.error("Error al cargar subastas del usuario:", err);
    }
  };

  useEffect(() => {
    if (auctionManagerContract && nftContract && account) {
      fetchMyAuctions();
    }
  }, [auctionManagerContract, nftContract, account]);

  if (!account) return <p className="loading">Conecta tu wallet para ver tus subastas.</p>;

  return (
    <div className="my-auctions">
      <h2 className="section-title">📦 Mis Subastas</h2>
      <p className="section-subtitle">Gestiona tus subastas activas y revisa el historial de subastas finalizadas.</p>

      <h3 className="section-subheader">🟢 Subastas Activas</h3>
      {activeAuctions.length === 0 ? (
        <p className="no-auctions">No tienes subastas activas.</p>
      ) : (
        <div className="auction-grid">
          {activeAuctions.map((auction) => {
            const imageUrl = auction.metadata.image.startsWith("ipfs://")
              ? auction.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : auction.tokenURI.replace(/[^/]+$/, auction.metadata.image);

            return (
              <div className="auction-card" key={auction.id}>
                <img
                  src={imageUrl}
                  alt={`NFT #${auction.tokenId}`}
                  className="auction-image"
                />
                <div className="auction-info">
                  <p><strong>{auction.metadata.name || `NFT #${auction.tokenId}`}</strong></p>
                  {auction.metadata.attributes?.map(attr => (
                    <p key={attr.trait_type}><strong>{attr.trait_type}:</strong> {attr.value}</p>
                  ))}
                  <p>💰 {auction.highestBid / 1e18} ETH</p>
                  <p><CountdownTimer endTime={auction.endTime} /></p>
                </div>
                <div className="auction-actions">
                  <a href={`/auction/${auction.id}`} className="auction-button">Ver / Pujar</a>
                  <a href={`/auction/${auction.id}/finalize`} className="auction-button finalize">Finalizar</a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 className="section-subheader">📜 Historial de Subastas Finalizadas</h3>
      {finishedAuctions.length === 0 ? (
        <p className="no-auctions">Aún no has finalizado ninguna subasta.</p>
      ) : (
        <div className="auction-grid">
          {finishedAuctions.map((auction) => {
            const imageUrl = auction.metadata.image.startsWith("ipfs://")
              ? auction.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : auction.tokenURI.replace(/[^/]+$/, auction.metadata.image);

            return (
              <div className="auction-card" key={auction.id}>
                <img
                  src={imageUrl}
                  alt={`NFT #${auction.tokenId}`}
                  className="auction-image"
                />
                <div className="auction-info">
                  <p><strong>{auction.metadata.name || `NFT #${auction.tokenId}`}</strong></p>
                  {auction.metadata.attributes?.map(attr => (
                    <p key={attr.trait_type}><strong>{attr.trait_type}:</strong> {attr.value}</p>
                  ))}
                  <p>💰 Puja ganadora: {auction.highestBid / 1e18} ETH</p>
                  <p>🏆 Ganador: {auction.highestBidder}</p>
                </div>
                <a href={`/auction/${auction.id}`} className="auction-button">Ver detalles</a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAuctions;
