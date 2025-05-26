import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3Context";
import { useNavigate } from "react-router-dom";
import MintNFT from "./MintNFT";
import "../styles/MyNFTs.css";

const MyNFTs = () => {
  const { nftContract, account } = useWeb3();
  const [nfts, setNfts] = useState([]);
  const [allNFTs, setAllNFTs] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!nftContract) return;

      const total = await nftContract.nextTokenId();
      const owned = [];
      const all = [];

      for (let i = 0; i < total; i++) {
        try {
          const owner = await nftContract.ownerOf(i);
          const uri = await nftContract.tokenURI(i);

          const metadataUrl = uri.startsWith("ipfs://")
            ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
            : uri;

          const res = await fetch(metadataUrl);
          const metadata = await res.json();

          const nft = {
            tokenId: i.toString(),
            tokenURI: uri,
            owner,
            metadata
          };

          all.push(nft);
          if (account && owner.toLowerCase() === account.toLowerCase()) {
            owned.push(nft);
          }
        } catch (err) {
          continue;
        }
      }

      setNfts(owned);
      setAllNFTs(all);
    };

    fetchNFTs();
  }, [nftContract, account]);

  const displayedNFTs = showAll ? allNFTs : nfts;

  return (
    <div className="my-nfts-container">
      <h2>{showAll ? "🗂 Todos los NFTs (modo admin)" : "🎨 Mis NFTs"}</h2>
      <p>{showAll ? "Vista de inspección de todos los NFTs creados en el contrato." : "Tus NFTs personales y opción para mintear nuevos."}</p>

      <div className="admin-toggle">
        <button onClick={() => setShowAll(!showAll)}>
          {showAll ? "🔒 Ver solo mis NFTs" : "🔓 Ver todos los NFTs"}
        </button>
      </div>

      {!showAll && <MintNFT />}

      {displayedNFTs.length === 0 ? (
        <p>No hay NFTs disponibles.</p>
      ) : (
        <div className="nft-grid">
          {displayedNFTs.map(({ tokenId, tokenURI, owner, metadata }) => {
            const imageUrl = metadata.image.startsWith("ipfs://")
              ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : tokenURI.replace(/[^/]+$/, metadata.image);

            return (
              <div key={tokenId} className="nft-card">
                <img
                  src={imageUrl}
                  alt={`NFT #${tokenId}`}
                  className="nft-image"
                />

                <p className="nft-label">{metadata.name || `NFT #${tokenId}`}</p>
                {metadata.attributes?.map(attr => (
                  <p key={attr.trait_type} className="nft-attribute">
                    <strong>{attr.trait_type}:</strong> {attr.value}
                  </p>
                ))}

                {showAll && <p className="nft-owner">👤 {owner.slice(0, 6)}...{owner.slice(-4)}</p>}
                {!showAll && (
                  <button onClick={() => navigate(`/create-auction/${tokenId}`)} className="nft-button">
                    Crear Subasta
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyNFTs;
