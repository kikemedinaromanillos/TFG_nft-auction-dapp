import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3Context";
import CountdownTimer from "./CountdownTimer";
import "../styles/AuctionList.css";

const AuctionList = () => {
  const { auctionManagerContract, nftContract } = useWeb3();
  const [auctions, setAuctions] = useState([]);

  const fetchAuctions = async () => {
    try {
      const count = await auctionManagerContract.auctionCount();
      const activeAuctions = [];

      for (let i = 0; i < count; i++) {
        const auction = await auctionManagerContract.auctions(i);
        if (!auction.ended) {
          const tokenId = Number(auction.tokenId);
          const highestBid = Number(auction.highestBid);
          const endTime = Number(auction.endTime);
      
          const tokenURI = await nftContract.tokenURI(tokenId);
      
          activeAuctions.push({
            id: i,
            tokenId,
            highestBid,
            endTime,
            ended: auction.ended,
            seller: auction.seller,
            highestBidder: auction.highestBidder,
            tokenURI,
          });
        }
      }

      setAuctions(activeAuctions);
    } catch (err) {
      console.error("Error al cargar subastas:", err);
    }
  };

  useEffect(() => {
    if (auctionManagerContract && nftContract) {
      fetchAuctions();
    }
  }, [auctionManagerContract]);

  return (
    <div className="auction-list">
      <h3 className="auction-ready">Subastas Activas</h3>

      {auctions.length === 0 ? (
        <p className="no-auctions">No hay subastas activas</p>
      ) : (
        <div className="auction-grid">
          {auctions.map((auction) => (
            <div className="auction-card" key={auction.id}>
              <img
                src={auction.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
                alt={`NFT #${auction.tokenId}`}
              />
              <p><strong>NFT #{auction.tokenId}</strong></p>
              <p><strong>Tiempo restante:</strong> <CountdownTimer endTime={auction.endTime} /></p>
              <p><strong>Mejor puja:</strong> {auction.highestBid / 1e18} ETH</p>
              <a href={`/auction/${auction.id}`}>Ver/Pujar</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionList;
