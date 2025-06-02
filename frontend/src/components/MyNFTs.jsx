"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "../Web3Context"
import { useNavigate } from "react-router-dom"
import MintNFT from "./MintNFT"
import { ImageIcon, User, Eye, EyeOff, Gavel } from "lucide-react"

const MyNFTs = () => {
  const { nftContract, account } = useWeb3()
  const [nfts, setNfts] = useState([])
  const [allNFTs, setAllNFTs] = useState([])
  const [showAll, setShowAll] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!nftContract) return

      const total = await nftContract.nextTokenId()
      const owned = []
      const all = []

      for (let i = 0; i < total; i++) {
        try {
          const owner = await nftContract.ownerOf(i)
          const uri = await nftContract.tokenURI(i)

          const metadataUrl = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri

          const res = await fetch(metadataUrl)
          const metadata = await res.json()

          const nft = {
            tokenId: i.toString(),
            tokenURI: uri,
            owner,
            metadata,
          }

          all.push(nft)
          if (account && owner.toLowerCase() === account.toLowerCase()) {
            owned.push(nft)
          }
        } catch (err) {
          continue
        }
      }

      setNfts(owned)
      setAllNFTs(all)
    }

    fetchNFTs()
  }, [nftContract, account])

  const displayedNFTs = showAll ? allNFTs : nfts

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
          <div className="relative glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-thin bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center space-x-3">
                  <ImageIcon className="w-8 h-8 text-blue-400" />
                  <span>{showAll ? "Todos los NFTs" : "Mis NFTs"}</span>
                </h2>
                <p className="text-gray-400 font-light mt-2">
                  {showAll
                    ? "Vista en modo administrador de inspección de todos los NFTs creados en el contrato."
                    : "Tus NFTs personales y opción para mintear nuevos."}
                </p>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => setShowAll(!showAll)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-light ${
                  showAll
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 glow-orange-soft"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30 glow-blue-soft"
                }`}
              >
                {showAll ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="hidden sm:block">Ver solo mis NFTs</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:block">Ver todos los NFTs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mint Section - Only show when viewing personal NFTs */}
        {!showAll && (
          <div className="mb-8">
            <MintNFT />
          </div>
        )}

        {/* NFTs Grid */}
        {displayedNFTs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl text-gray-400 font-light">No hay NFTs disponibles</p>
            <p className="text-gray-500 mt-2">
              {showAll ? "No se han creado NFTs en este contrato" : "Mintea tu primer NFT para comenzar"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedNFTs.map(({ tokenId, tokenURI, owner, metadata }) => {
              const imageUrl = metadata.image.startsWith("ipfs://")
                ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                : tokenURI.replace(/[^/]+$/, metadata.image)

              return (
                <div key={tokenId} className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                  {/* NFT Image */}
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`NFT #${tokenId}`}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-purple-500/20 backdrop-blur-sm rounded-full p-2 glow-purple-soft">
                        <span className="text-purple-400 font-mono text-sm">#{tokenId}</span>
                      </div>
                    </div>
                  </div>

                  {/* NFT Info */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-light text-white truncate">{metadata.name || `NFT #${tokenId}`}</h4>

                    {/* Attributes */}
                    {metadata.attributes?.slice(0, 2).map((attr) => (
                      <div key={attr.trait_type} className="flex justify-between text-sm">
                        <span className="text-gray-400">{attr.trait_type}:</span>
                        <span className="text-blue-400 font-mono truncate ml-2">{attr.value}</span>
                      </div>
                    ))}

                    {/* Owner (only in admin view) */}
                    {showAll && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Owner:</span>
                        <span className="text-purple-400 font-mono text-sm">
                          {owner.slice(0, 6)}...{owner.slice(-4)}
                        </span>
                      </div>
                    )}

                    {/* Action Button (only for owned NFTs) */}
                    {!showAll && (
                      <button
                        onClick={() => navigate(`/create-auction/${tokenId}`)}
                        className="w-full bg-gradient-to-r from-lime-500/20 to-blue-500/20 hover:from-lime-500/30 hover:to-blue-500/30 text-lime-400 hover:text-white border border-lime-500/30 rounded-lg py-3 px-4 transition-all duration-200 font-light glow-lime-soft hover:glow-lime"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Gavel className="w-4 h-4" />
                          <span>Crear Subasta</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyNFTs
