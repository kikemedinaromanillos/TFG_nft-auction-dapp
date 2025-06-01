"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useWeb3 } from "../Web3Context"
import { useToast } from "../hooks/useToast"
import { parseEther } from "ethers"
import { Gavel, Clock, DollarSign, Zap, AlertTriangle } from "lucide-react"

const CreateAuction = () => {
  const { tokenId: tokenIdParam } = useParams()
  const navigate = useNavigate()
  const { nftContract, auctionManagerContract, account } = useWeb3()
  const { showSuccess, showError, showWarning } = useToast()

  const [tokenId, setTokenId] = useState("")
  const [startingBid, setStartingBid] = useState("0.01")
  const [duration, setDuration] = useState("86400") // 1 día por defecto
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tokenIdParam) setTokenId(tokenIdParam)
  }, [tokenIdParam])

  const handleCreateAuction = async () => {
    if (!tokenId || !startingBid || !duration) {
      showWarning("Rellena todos los campos")
      return
    }

    try {
      setLoading(true)

      const nftAddress = await nftContract.getAddress()
      const parsedBid = parseEther(startingBid)
      const parsedDuration = Number.parseInt(duration)

      const isApproved = await nftContract.getApproved(tokenId)
      const managerAddress = await auctionManagerContract.getAddress()

      if (isApproved.toLowerCase() !== managerAddress.toLowerCase()) {
        showWarning("Este NFT no está aprobado para el gestor de subastas")
        setLoading(false)
        return
      }

      const tx = await auctionManagerContract.createAuction(nftAddress, tokenId, parsedBid, parsedDuration)

      await tx.wait()
      showSuccess(`✅ Subasta creada para NFT #${tokenId}`)
      setTokenId("")
      navigate("/")
    } catch (err) {
      console.error("❌ Error al crear la subasta:", err)
      showError("Error al crear la subasta. Revisa consola.")
    } finally {
      setLoading(false)
    }
  }

  const durationOptions = [
    { value: "3600", label: "1 hora" },
    { value: "86400", label: "1 día" },
    { value: "259200", label: "3 días" },
    { value: "604800", label: "1 semana" },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-lime-500/20 blur-3xl"></div>
          <div className="relative glass-card p-6">
            <h2 className="text-3xl font-thin bg-gradient-to-r from-purple-400 via-blue-400 to-lime-400 bg-clip-text text-transparent flex items-center space-x-3">
              <Gavel className="w-8 h-8 text-purple-400" />
              <span>Crear Subasta</span>
            </h2>
            <p className="text-gray-400 font-light mt-2">
              Completa los campos para subastar tu NFT. Asegúrate de haber aprobado el NFT antes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-light text-white">Configuración de Subasta</h3>

            {/* Token ID */}
            {tokenIdParam ? (
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-light">ID del NFT:</label>
                <div className="p-4 bg-lime-500/10 rounded-lg border border-lime-500/20">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-lime-400" />
                    <span className="text-lime-400 font-mono text-lg">#{tokenId}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-light">ID del NFT:</label>
                <input
                  type="text"
                  placeholder="Ingresa el ID del NFT"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Starting Bid */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-light">Puja inicial (ETH):</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.01"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 pr-16 text-white font-mono placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 font-mono">ETH</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-light">Duración:</label>
              <div className="grid grid-cols-2 gap-3">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDuration(option.value)}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      duration === option.value
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-400 glow-purple-soft"
                        : "bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-light">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Duración personalizada en segundos"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors mt-3"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateAuction}
              disabled={!account || loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-light py-4 px-6 rounded-lg transition-all duration-200 glow-purple-soft hover:glow-purple disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creando...</span>
                </div>
              ) : (
                "Crear Subasta"
              )}
            </button>

            {!account && (
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-light">Conecta tu wallet para continuar</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-light text-white mb-4">Consejos</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-lime-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lime-400 text-xs">1</span>
                  </div>
                  <div>
                    <p className="text-gray-300 font-light">Asegúrate de que tu NFT esté aprobado</p>
                    <p className="text-gray-500 text-sm">El contrato necesita permisos para transferir tu NFT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs">2</span>
                  </div>
                  <div>
                    <p className="text-gray-300 font-light">Establece un precio inicial justo</p>
                    <p className="text-gray-500 text-sm">Un precio muy alto puede desalentar a los pujadores</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-xs">3</span>
                  </div>
                  <div>
                    <p className="text-gray-300 font-light">Elige la duración adecuada</p>
                    <p className="text-gray-500 text-sm">
                      Más tiempo permite más pujas, pero puede reducir la urgencia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-light text-white mb-4">Vista Previa</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">NFT ID:</span>
                  <span className="text-white font-mono">#{tokenId || "---"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Puja inicial:</span>
                  <span className="text-lime-400 font-mono">{startingBid || "0.00"} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duración:</span>
                  <span className="text-blue-400 font-mono">
                    {duration ? `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m` : "---"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAuction
