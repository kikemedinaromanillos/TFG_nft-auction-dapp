import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import CountdownTimer from "./CountdownTimer";
import { parseEther, formatEther } from "ethers";
import "../styles/BidAuction.css";

const BidAuction = () => {
  const { id } = useParams();
  const { auctionManagerContract, nftContract, account } = useWeb3();
  const { showSuccess, showError, showWarning } = useToast();

  const [auction, setAuction] = useState(null);
  const [tokenURI, setTokenURI] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAuction = async () => {
    try {
      const a = await auctionManagerContract.auctions(id);
      const tokenId = Number(a.tokenId);
      const highestBid = a.highestBid;       // mantener BigInt o BigNumber
      const startingBid = a.startingBid;
      const endTime = Number(a.endTime);

      const uri = await nftContract.tokenURI(tokenId);

      setAuction({
        tokenId,
        highestBid,
        startingBid,
        endTime,
        ended: a.ended,
        seller: a.seller,
        highestBidder: a.highestBidder,
      });

      setTokenURI(uri);
    } catch (err) {
      console.error("❌ Error al cargar subasta:", err);
      showError("No se pudo cargar la subasta.");
    }
  };

  const handleBid = async () => {
    if (!auction) return;

    const bid = parseFloat(bidAmount);
    const minBidEth = Math.max(
      Number(formatEther(auction.startingBid)),
      Number(formatEther(auction.highestBid)) + 0.0001
    );

    if (isNaN(bid) || bid < minBidEth) {
      showWarning(`La puja mínima es de ${Math.ceil(minBidEth)} ETH`);
      return;
    }

    try {
      setLoading(true);
      const tx = await auctionManagerContract.bid(id, {
        value: parseEther(bidAmount),
      });
      await tx.wait();
      showSuccess("Puja realizada correctamente");
      fetchAuction();
      setBidAmount("");
    } catch (err) {
      console.error(err);
      showError("Error al pujar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionManagerContract && nftContract) {
      fetchAuction();
      window.auctionManagerContract = auctionManagerContract;
      window.nftContract = nftContract;
    }
  }, [auctionManagerContract, nftContract]);

  if (!auction) return <p>Cargando subasta...</p>;

  const minBidValue = Math.max(
    parseFloat(formatEther(auction.startingBid)),
    parseFloat(formatEther(auction.highestBid)) + 0.0001
  );
  const minBidFormatted = Math.ceil(minBidValue);

  return (
    <div className="bid-container">
      <h2>Subasta NFT #{auction.tokenId}</h2>
      <img
        src={tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
        alt={`NFT #${auction.tokenId}`}
        style={{ maxWidth: "100%", marginBottom: "1rem", borderRadius: "10px" }}
      />
      <p><strong>Vendedor:</strong> {auction.seller}</p>
      <p><strong>Mejor puja:</strong> {Number(formatEther(auction.highestBid))} ETH</p>
      <p><strong>Tiempo restante:</strong> <CountdownTimer endTime={auction.endTime} /></p>

      <div className="input-with-unit full-width">
        <input
          type="text"
          placeholder={`${minBidFormatted} (minimum bid)`}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
        />
        <span className="unit-label">ETH</span>
      </div>

      <button onClick={handleBid} disabled={loading || !account} className="full-width">
        {loading ? "Pujando..." : "PLACE A BID"}
      </button>
    </div>
  );
};

export default BidAuction;
