import { useState, useEffect } from "react";
import { useWeb3 } from "../Web3Context";

const AuctionCard = () => {
    const { auctionContract } = useWeb3();
    const [highestBid, setHighestBid] = useState("0");
    const [highestBidder, setHighestBidder] = useState("0x000...0000");
    const [bidAmount, setBidAmount] = useState("");

    // Obtener la información inicial de la subasta
    useEffect(() => {
        const fetchAuctionDetails = async () => {
            if (!auctionContract) return;

            const bid = await auctionContract.highestBid();
            const bidder = await auctionContract.highestBidder();

            setHighestBid(ethers.formatEther(bid));
            setHighestBidder(bidder);
        };

        fetchAuctionDetails();
    }, [auctionContract]);

    // Enviar puja
    const handleBid = async () => {
        if (!auctionContract) return alert("Contrato no encontrado.");

        try {
            const tx = await auctionContract.bid({
                value: ethers.parseEther(bidAmount)
            });
            await tx.wait();

            alert(`✅ Puja enviada por ${bidAmount} ETH`);
            setBidAmount("");

            // Actualizar estado tras la puja
            const bid = await auctionContract.highestBid();
            const bidder = await auctionContract.highestBidder();

            setHighestBid(ethers.formatEther(bid));
            setHighestBidder(bidder);

        } catch (error) {
            console.error("❌ Error en la puja:", error);
            alert("❌ Error en la puja.");
        }
    };

    return (
        <div className="auction-card">
            <h2>🏆 Subasta Activa</h2>
            <p><strong>Mejor oferta:</strong> {highestBid} ETH</p>
            <p><strong>Mejor postor:</strong> {highestBidder.slice(0, 6)}...{highestBidder.slice(-4)}</p>

            <div className="bid-section">
                <input
                    type="text"
                    placeholder="Monto en ETH"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                />
                <button onClick={handleBid} className="bid-button">
                    Enviar Puja
                </button>
            </div>
        </div>
    );
};

export default AuctionCard;
