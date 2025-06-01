"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "../Web3Context"
import CountdownTimer from "./CountdownTimer"
import { Clock, TrendingUp, Eye, Zap } from "lucide-react"

const AuctionList = () => {
  const { auctionManagerContract, nftContract, account } = useWeb3()
  const [auctions, setAuctions] = useState([])

  const fetchAuctions = async () => {
    try {
      const count = await auctionManagerContract.auctionCount()
      const activeAuctions = []

      for (let i = 0; i < count; i++) {
        const auction = await auctionManagerContract.auctions(i)
        if (!auction.ended) {
          const tokenId = Number(auction.tokenId)
          const highestBid = Number(auction.highestBid)
          const endTime = Number(auction.endTime)

          const tokenURI = await nftContract.tokenURI(tokenId)
          const metadataUrl = tokenURI.startsWith("ipfs://")
            ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            : tokenURI

          const res = await fetch(metadataUrl)
          const metadata = await res.json()

          activeAuctions.push({
            id: i,
            tokenId,
            highestBid,
            endTime,
            ended: auction.ended,
            seller: auction.seller,
            highestBidder: auction.highestBidder,
            tokenURI,
            metadata,
          })
        }
      }

      setAuctions(activeAuctions)
    } catch (err) {
      console.error("Error al cargar subastas:", err)
    }
  }

  useEffect(() => {
    // Cargar subastas tan pronto como los contratos estén disponibles
    // independientemente de si hay account conectado
    if (auctionManagerContract && nftContract) {
      fetchAuctions()
    }
  }, [auctionManagerContract, nftContract])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 via-blue-500/20 to-purple-500/20 blur-3xl"></div>
          <div className="relative glass-card p-8 text-center">
            <h3 className="text-4xl font-thin mb-4 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Subastas Activas
            </h3>
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Zap className="w-5 h-5 text-lime-400" />
              <span className="font-light">Descubre NFTs únicos en tiempo real</span>
            </div>
            {!account && (
              <p className="text-gray-500 text-sm mt-2">
                💡 Puedes explorar libremente. Conecta tu wallet solo cuando quieras pujar
              </p>
            )}
          </div>
        </div>

        {auctions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl text-gray-400 font-light">No hay subastas activas</p>
            <p className="text-gray-500 mt-2">Sé el primero en crear una subasta</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map(({ id, tokenId, highestBid, endTime, tokenURI, metadata }) => {
              const imageUrl = metadata.image.startsWith("ipfs://")
                ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                : tokenURI.replace(/[^/]+$/, metadata.image)

              return (
                <div
                  key={id}
                  className="glass-card p-6 hover:scale-105 transition-all duration-300 group cursor-pointer"
                >
                  {/* NFT Image */}
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`NFT #${tokenId}`}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-lime-500/20 backdrop-blur-sm rounded-full p-2 glow-lime-soft">
                        <TrendingUp className="w-4 h-4 text-lime-400" />
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
                        <span className="text-blue-400 font-mono">{attr.value}</span>
                      </div>
                    ))}

                    {/* Timer */}
                    <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400 text-sm">Tiempo restante:</span>
                      <div className="text-purple-400 font-mono text-sm">
                        <CountdownTimer endTime={endTime} />
                      </div>
                    </div>

                    {/* Current Bid */}
                    <div className="flex items-center justify-between p-3 bg-lime-500/10 rounded-lg border border-lime-500/20">
                      <span className="text-gray-400 text-sm">Mejor puja:</span>
                      <div className="text-lime-400 font-mono font-bold">{(highestBid / 1e18).toFixed(4)} ETH</div>
                    </div>

                    {/* Action Button */}
                    <a href={`/auction/${id}`} className="block w-full">
                      <button className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 hover:text-white border border-purple-500/30 rounded-lg py-3 px-4 transition-all duration-200 font-light glow-purple-soft hover:glow-purple">
                        <div className="flex items-center justify-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>Ver/Pujar</span>
                        </div>
                      </button>
                    </a>
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

export default AuctionList
