"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "../Web3Context"
import CountdownTimer from "./CountdownTimer"
import { Gavel, Clock, Trophy, Eye, Zap, CheckCircle, DollarSign } from "lucide-react"

const MyAuctions = () => {
  const { auctionManagerContract, nftContract, account } = useWeb3()
  const [activeAuctions, setActiveAuctions] = useState([])
  const [finishedAuctions, setFinishedAuctions] = useState([])

  const fetchMyAuctions = async () => {
    try {
      const count = await auctionManagerContract.auctionCount()
      const active = []
      const finished = []

      for (let i = 0; i < count; i++) {
        const auction = await auctionManagerContract.auctions(i)

        if (auction.seller.toLowerCase() === account.toLowerCase()) {
          const tokenId = Number(auction.tokenId)
          const highestBid = Number(auction.highestBid)
          const endTime = Number(auction.endTime)
          const tokenURI = await nftContract.tokenURI(tokenId)

          const metadataUrl = tokenURI.startsWith("ipfs://")
            ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            : tokenURI

          const res = await fetch(metadataUrl)
          const metadata = await res.json()

          const auctionData = {
            id: i,
            tokenId,
            highestBid,
            endTime,
            ended: auction.ended,
            seller: auction.seller,
            highestBidder: auction.highestBidder,
            tokenURI,
            metadata,
          }

          if (auction.ended) {
            finished.push(auctionData)
          } else {
            active.push(auctionData)
          }
        }
      }

      setActiveAuctions(active)
      setFinishedAuctions(finished)
    } catch (err) {
      console.error("Error al cargar subastas del usuario:", err)
    }
  }

  useEffect(() => {
    if (auctionManagerContract && nftContract && account) {
      fetchMyAuctions()
    }
  }, [auctionManagerContract, nftContract, account])

  if (!account) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-orange-400 font-light text-lg">Conecta tu wallet para ver tus subastas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-lime-500/20 blur-3xl"></div>
          <div className="relative glass-card p-6">
            <h2 className="text-3xl font-thin bg-gradient-to-r from-purple-400 via-blue-400 to-lime-400 bg-clip-text text-transparent flex items-center space-x-3">
              <Gavel className="w-8 h-8 text-purple-400" />
              <span>Mis Subastas</span>
            </h2>
            <p className="text-gray-400 font-light mt-2">
              Gestiona tus subastas activas y revisa el historial de subastas finalizadas.
            </p>
          </div>
        </div>

        {/* Active Auctions Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-lime-500/20 rounded-lg flex items-center justify-center glow-lime-soft">
              <Zap className="w-5 h-5 text-lime-400" />
            </div>
            <h3 className="text-2xl font-light text-lime-400">Subastas Activas</h3>
          </div>

          {activeAuctions.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 font-light">No tienes subastas activas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAuctions.map((auction) => {
                const imageUrl = auction.metadata.image.startsWith("ipfs://")
                  ? auction.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : auction.tokenURI.replace(/[^/]+$/, auction.metadata.image)

                return (
                  <div key={auction.id} className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                    {/* NFT Image */}
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`NFT #${auction.tokenId}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-lime-500/20 backdrop-blur-sm rounded-full p-2 glow-lime-soft">
                          <Zap className="w-4 h-4 text-lime-400" />
                        </div>
                      </div>
                    </div>

                    {/* NFT Info */}
                    <div className="space-y-3 mb-4">
                      <h4 className="text-lg font-light text-white truncate">
                        {auction.metadata.name || `NFT #${auction.tokenId}`}
                      </h4>

                      {/* Attributes */}
                      {auction.metadata.attributes?.slice(0, 2).map((attr) => (
                        <div key={attr.trait_type} className="flex justify-between text-sm">
                          <span className="text-gray-400">{attr.trait_type}:</span>
                          <span className="text-blue-400 font-mono">{attr.value}</span>
                        </div>
                      ))}

                      {/* Current Bid */}
                      <div className="flex items-center justify-between p-3 bg-lime-500/10 rounded-lg border border-lime-500/20">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-lime-400" />
                          <span className="text-gray-400 text-sm">Mejor puja:</span>
                        </div>
                        <span className="text-lime-400 font-mono font-bold">
                          {(auction.highestBid / 1e18).toFixed(4)} ETH
                        </span>
                      </div>

                      {/* Timer */}
                      <div className="flex items-center space-x-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <CountdownTimer endTime={auction.endTime} />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <a href={`/auction/${auction.id}`} className="block w-full">
                        <button className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg py-2 px-4 transition-all duration-200 font-light">
                          <div className="flex items-center justify-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>Ver / Pujar</span>
                          </div>
                        </button>
                      </a>

                      <a href={`/auction/${auction.id}/finalize`} className="block w-full">
                        <button className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-400 hover:text-white border border-orange-500/30 rounded-lg py-2 px-4 transition-all duration-200 font-light">
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Finalizar</span>
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

        {/* Finished Auctions Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center glow-purple-soft">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-light text-purple-400">Historial de Subastas Finalizadas</h3>
          </div>

          {finishedAuctions.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 font-light">Aún no has finalizado ninguna subasta</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedAuctions.map((auction) => {
                const imageUrl = auction.metadata.image.startsWith("ipfs://")
                  ? auction.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : auction.tokenURI.replace(/[^/]+$/, auction.metadata.image)

                return (
                  <div key={auction.id} className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                    {/* NFT Image */}
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`NFT #${auction.tokenId}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-purple-500/20 backdrop-blur-sm rounded-full p-2 glow-purple-soft">
                          <CheckCircle className="w-4 h-4 text-purple-400" />
                        </div>
                      </div>
                    </div>

                    {/* NFT Info */}
                    <div className="space-y-3 mb-4">
                      <h4 className="text-lg font-light text-white truncate">
                        {auction.metadata.name || `NFT #${auction.tokenId}`}
                      </h4>

                      {/* Attributes */}
                      {auction.metadata.attributes?.slice(0, 2).map((attr) => (
                        <div key={attr.trait_type} className="flex justify-between text-sm">
                          <span className="text-gray-400">{attr.trait_type}:</span>
                          <span className="text-blue-400 font-mono">{attr.value}</span>
                        </div>
                      ))}

                      {/* Final Bid */}
                      <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400 text-sm">Puja ganadora:</span>
                        </div>
                        <span className="text-purple-400 font-mono font-bold">
                          {(auction.highestBid / 1e18).toFixed(4)} ETH
                        </span>
                      </div>

                      {/* Winner */}
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400 text-sm">Ganador:</span>
                        </div>
                        <span className="text-yellow-400 font-mono text-sm">
                          {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <a href={`/auction/${auction.id}`} className="block w-full">
                      <button className="w-full bg-gradient-to-r from-gray-500/20 to-gray-600/20 hover:from-gray-500/30 hover:to-gray-600/30 text-gray-400 hover:text-white border border-gray-500/30 rounded-lg py-2 px-4 transition-all duration-200 font-light">
                        <div className="flex items-center justify-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>Ver detalles</span>
                        </div>
                      </button>
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyAuctions
