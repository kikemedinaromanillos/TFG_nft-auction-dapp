"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useWeb3 } from "../Web3Context"
import { useToast } from "../hooks/useToast"
import CountdownTimer from "./CountdownTimer"
import { parseEther, formatEther } from "ethers"
import { Clock, User, TrendingUp, Zap, DollarSign, Wallet } from "lucide-react"

const BidAuction = () => {
  const { id } = useParams()
  const { auctionManagerContract, nftContract, account, connectWallet } = useWeb3()
  const { showSuccess, showError, showWarning } = useToast()

  const [auction, setAuction] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [ethPrice, setEthPrice] = useState(null)

  // Función para truncar texto largo (especialmente direcciones)
  const truncateText = (text, maxLength = 20) => {
    if (!text) return text
    const str = text.toString()
    if (str.length <= maxLength) return str

    // Si parece una dirección de Ethereum (empieza con 0x)
    if (str.startsWith("0x") && str.length === 42) {
      return `${str.slice(0, 6)}...${str.slice(-4)}`
    }

    // Para otros textos largos
    if (str.length > maxLength) {
      return `${str.slice(0, maxLength)}...`
    }

    return str
  }

  // Función para obtener el precio de ETH
  const fetchEthPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      const data = await response.json()
      setEthPrice(data.ethereum.usd)
    } catch (err) {
      console.error("Error al obtener precio de ETH:", err)
    }
  }

  // Función para convertir ETH a USD
  const ethToUsd = (ethAmount) => {
    if (!ethPrice) return null
    return (ethAmount * ethPrice).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const fetchAuction = async () => {
    try {
      const a = await auctionManagerContract.auctions(id)
      const tokenId = Number(a.tokenId)
      const highestBid = a.highestBid
      const startingBid = a.startingBid
      const endTime = Number(a.endTime)

      const uri = await nftContract.tokenURI(tokenId)
      const metadataUrl = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri

      const res = await fetch(metadataUrl)
      const data = await res.json()

      setAuction({
        tokenId,
        highestBid,
        startingBid,
        endTime,
        ended: a.ended,
        seller: a.seller,
        highestBidder: a.highestBidder,
        tokenURI: uri,
      })
      setMetadata(data)
    } catch (err) {
      console.error("❌ Error al cargar subasta:", err)
      showError("No se pudo cargar la subasta.")
    }
  }

  const handleBid = async () => {
    if (!account) {
      showWarning("Conecta tu wallet para pujar")
      return
    }

    if (!auction) return

    const bid = Number.parseFloat(bidAmount)
    const minBidEth = Math.max(
      Number(formatEther(auction.startingBid)),
      Number(formatEther(auction.highestBid)) + 0.0001,
    )

    if (isNaN(bid) || bid < minBidEth) {
      showWarning(`La puja mínima es de ${minBidEth} ETH`)
      return
    }

    try {
      setLoading(true)
      const tx = await auctionManagerContract.bid(id, {
        value: parseEther(bidAmount),
      })
      await tx.wait()
      showSuccess("Puja realizada correctamente")
      fetchAuction()
      setBidAmount("")
    } catch (err) {
      console.error(err)
      showError("Error al pujar")
    } finally {
      setLoading(false)
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (err) {
      showError("Error al conectar wallet")
    }
  }

  useEffect(() => {
    // Cargar subasta independientemente de si hay wallet conectada
    if (auctionManagerContract && nftContract) {
      fetchAuction()
    }
    fetchEthPrice()
  }, [auctionManagerContract, nftContract]) // Removido 'account' de las dependencias

  if (!auction || !metadata) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-12 h-12 border-2 border-lime-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-light">Cargando subasta...</p>
        </div>
      </div>
    )
  }

  const imageUrl = metadata.image.startsWith("ipfs://")
    ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
    : auction.tokenURI.replace(/[^/]+$/, metadata.image)

  const minBidValue = Math.max(
    Number.parseFloat(formatEther(auction.startingBid)),
    Number.parseFloat(formatEther(auction.highestBid)) + 0.0001,
  )
  const minBidFormatted = minBidValue.toString()

  const currentBidEth = Number(formatEther(auction.highestBid))
  const currentBidUsd = ethToUsd(currentBidEth)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-lime-500/20 blur-3xl"></div>
          <div className="relative glass-card p-6">
            <h2 className="text-3xl font-thin bg-gradient-to-r from-purple-400 via-blue-400 to-lime-400 bg-clip-text text-transparent">
              Subasta NFT #{auction.tokenId}
            </h2>
            {ethPrice && (
              <p className="text-gray-400 text-sm mt-2">
                ETH: ${ethPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {!account && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">
                  💡 Puedes ver todos los detalles. Conecta tu wallet cuando quieras pujar
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - NFT Image & Details */}
          <div className="space-y-6">
            {/* NFT Image */}
            <div className="glass-card p-6">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={`NFT #${auction.tokenId}`}
                  className="w-full h-auto rounded-xl"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-lime-500/20 backdrop-blur-sm rounded-full p-3 glow-lime-soft">
                    <Zap className="w-6 h-6 text-lime-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* NFT Metadata */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xl font-light text-white">{metadata.name}</h3>
              <p className="text-gray-400 font-light">{metadata.description}</p>

              {metadata.attributes && (
                <div className="space-y-3">
                  <h4 className="text-lg font-light text-blue-400">Atributos</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {metadata.attributes.map((attr) => (
                      <div key={attr.trait_type} className="bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-gray-400 text-sm">{attr.trait_type}</div>
                        <div className="text-white font-mono text-sm break-all" title={attr.value}>
                          {truncateText(attr.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Auction Info & Bidding */}
          <div className="space-y-6">
            {/* Auction Stats */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xl font-light text-white mb-4">Información de Subasta</h3>

              {/* Seller */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400">Vendedor:</span>
                </div>
                <span className="text-purple-400 font-mono text-sm">
                  {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
                </span>
              </div>

              {/* Current Bid */}
              <div className="flex items-center justify-between p-4 bg-lime-500/10 rounded-lg border border-lime-500/20">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-lime-400" />
                  <span className="text-gray-400">Mejor puja:</span>
                </div>
                <div className="text-right">
                  <div className="text-lime-400 font-mono text-xl font-bold">{currentBidEth.toFixed(4)} ETH</div>
                  {currentBidUsd && <div className="text-gray-400 text-sm">≈ {currentBidUsd}</div>}
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">Tiempo restante:</span>
                </div>
                <div className="text-blue-400 font-mono">
                  <CountdownTimer endTime={auction.endTime} />
                </div>
              </div>
            </div>

            {/* Bidding Section */}
            <div className="glass-card p-6 space-y-6">
              <h3 className="text-xl font-light text-white">Realizar Puja</h3>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`${minBidFormatted} (puja mínima)`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    disabled={!account}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-4 pr-16 text-white font-mono placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 font-mono">ETH</span>
                  </div>
                </div>

                {/* Preview de conversión USD */}
                {bidAmount && ethPrice && !isNaN(Number.parseFloat(bidAmount)) && (
                  <div className="text-center text-gray-400 text-sm">≈ {ethToUsd(Number.parseFloat(bidAmount))}</div>
                )}

                {account ? (
                  <button
                    onClick={handleBid}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-light py-4 px-6 rounded-lg transition-all duration-200 glow-purple-soft hover:glow-purple disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Pujando...</span>
                      </div>
                    ) : (
                      "REALIZAR PUJA"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-light py-4 px-6 rounded-lg transition-all duration-200 glow-blue-soft hover:glow-blue"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Wallet className="w-5 h-5" />
                      <span>CONECTAR WALLET PARA PUJAR</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BidAuction
