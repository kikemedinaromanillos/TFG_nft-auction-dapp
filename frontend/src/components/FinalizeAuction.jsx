"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useWeb3 } from "../Web3Context"
import { useToast } from "../hooks/useToast"
import { ethers } from "ethers"
import { CheckCircle, Clock, AlertTriangle, Zap } from "lucide-react"

const FinalizeAuction = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { auctionManagerContract, nftContract, account } = useWeb3()
  const { showSuccess, showError } = useToast()

  const [auction, setAuction] = useState(null)
  const [tokenURI, setTokenURI] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentBlockTime, setCurrentBlockTime] = useState(null)

  const fetchAuction = async () => {
    try {
      const data = await auctionManagerContract.auctions(id)
      const uri = await nftContract.tokenURI(data.tokenId)
      setAuction(data)
      setTokenURI(uri)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const block = await provider.getBlock("latest")
      setCurrentBlockTime(block.timestamp)
    } catch (err) {
      console.error("❌ Error al cargar la subasta", err)
      showError("Error al cargar la subasta")
    }
  }

  const handleFinalize = async () => {
    try {
      setLoading(true)
      const tx = await auctionManagerContract.finalizeAuction(id)
      await tx.wait()
      showSuccess("✅ Subasta finalizada correctamente")

      setTimeout(() => {
        navigate("/my-auctions")
      }, 1500)
    } catch (err) {
      console.error(err)
      showError("❌ Error al finalizar la subasta")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auctionManagerContract && nftContract) {
      fetchAuction()
    }
  }, [id, auctionManagerContract, nftContract])

  if (!auction || currentBlockTime === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-12 h-12 border-2 border-lime-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-light">Cargando subasta...</p>
        </div>
      </div>
    )
  }

  const canFinalize =
    account?.toLowerCase() === auction.seller.toLowerCase() &&
    currentBlockTime >= Number(auction.endTime) &&
    !auction.ended

  const formattedEnd = new Date(Number(auction.endTime) * 1000).toLocaleString()

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 blur-3xl"></div>
          <div className="relative glass-card p-6">
            <h2 className="text-3xl font-thin bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent flex items-center space-x-3">
              <Zap className="w-8 h-8 text-orange-400" />
              <span>Finalizar Subasta #{id}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - NFT Preview */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-light text-white mb-4">NFT Preview</h3>

            {tokenURI.startsWith("ipfs://") ? (
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/") || "/placeholder.svg"}
                  alt={`NFT #${auction.tokenId}`}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-light">Imagen local</p>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <span className="text-gray-400">Token ID:</span>
                <span className="text-white font-mono">#{auction.tokenId}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Auction Details */}
          <div className="space-y-6">
            {/* Auction Info */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xl font-light text-white">Detalles de la Subasta</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400">Finaliza:</span>
                  </div>
                  <span className="text-blue-400 font-mono text-sm">{formattedEnd}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <span className="text-gray-400">Estado:</span>
                  <div className="flex items-center space-x-2">
                    {auction.ended ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-lime-400" />
                        <span className="text-lime-400">Finalizada</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400">Activa</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-light text-white mb-4">Acción</h3>

              {auction.ended ? (
                <div className="text-center p-8 bg-lime-500/10 rounded-lg border border-lime-500/20">
                  <CheckCircle className="w-16 h-16 text-lime-400 mx-auto mb-4" />
                  <p className="text-lime-400 text-lg font-light">Subasta finalizada</p>
                  <p className="text-gray-400 text-sm mt-2">Esta subasta ya ha sido completada</p>
                </div>
              ) : canFinalize ? (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      <span className="text-orange-400 font-light">Listo para finalizar</span>
                    </div>
                    <p className="text-gray-400 text-sm">La subasta ha terminado y puedes proceder a finalizarla.</p>
                  </div>

                  <button
                    onClick={handleFinalize}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-light py-4 px-6 rounded-lg transition-all duration-200 glow-orange-soft hover:glow-orange disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Finalizando...</span>
                      </div>
                    ) : (
                      "Finalizar Subasta"
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-800/30 rounded-lg">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 font-light">
                    Solo el vendedor puede finalizar la subasta una vez haya terminado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinalizeAuction
