import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3Context";
import CountdownTimer from "./CountdownTimer";

import "../styles/MyAuctions.css";

const MyAuctions = () => {
  const { auctionManagerContract, nftContract, account } = useWeb3();
  const [myAuctions, setMyAuctions] = useState([]);

  const fetchMyAuctions = async () => {
    try {
      const count = await auctionManagerContract.auctionCount();
      const results = [];

      for (let i = 0; i < count; i++) {
        const auction = await auctionManagerContract.auctions(i);
      
        if (auction.seller.toLowerCase() === account.toLowerCase()) {
          const tokenId = Number(auction.tokenId);
          const highestBid = Number(auction.highestBid);
          const endTime = Number(auction.endTime);
          const uri = await nftContract.tokenURI(tokenId);
      
          results.push({
            id: i,
            tokenId,
            highestBid,
            endTime,
            ended: auction.ended,
            seller: auction.seller,
            highestBidder: auction.highestBidder,
            tokenURI: uri,
          });
        }
      }

      setMyAuctions(results);
    } catch (err) {
      console.error("Error al cargar subastas del usuario:", err);
    }
  };

  useEffect(() => {
    if (auctionManagerContract && nftContract && account) {
      fetchMyAuctions();
    }
  }, [auctionManagerContract, account]);

  if (!account) return <p>Conecta tu wallet para ver tus subastas.</p>;

  return (
    <div className="my-auctions">
      <h3>Mis Subastas</h3>

      {myAuctions.length === 0 ? (
        <p>No has creado ninguna subasta.</p>
      ) : (
        <div className="my-auction-grid">
          {myAuctions.map((auction) => (
            <div className="my-auction-card" key={auction.id}>
              <img
                src={auction.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
                alt={`NFT #${auction.tokenId}`}
              />
              <p><strong>NFT #{auction.tokenId}</strong></p>
              <p>💰 Mejor puja: {auction.highestBid / 1e18} ETH</p>
              <p><strong>Tiempo restante:</strong> <CountdownTimer endTime={auction.endTime} /></p>
              <p>📌 Estado: {auction.ended ? "Finalizada" : "Activa"}</p>
              <a href={`/auction/${auction.id}`}>Ver/Pujar</a>
              {!auction.ended &&
                <a href={`/auction/${auction.id}/finalize`} className="finalize-link">
                  Finalizar
                </a>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAuctions;
