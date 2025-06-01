"use client"

import { useState } from "react"
import { useWeb3 } from "../Web3Context"
import { useToast } from "../hooks/useToast"
import { v4 as uuidv4 } from "uuid"
import { useNavigate } from "react-router-dom"
import { Zap, Palette, Sparkles, CheckCircle, Upload, ImageIcon } from "lucide-react"

const MintNFT = () => {
  const { nftContract, auctionManagerContract, account } = useWeb3()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [mode, setMode] = useState("auto") // "auto" o "upload"
  const [selectedFile, setSelectedFile] = useState(null)
  const [nftName, setNftName] = useState("")
  const [nftDescription, setNftDescription] = useState("")

  const generateImage = async () => {
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext("2d")

    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    const randomId = uuidv4().slice(0, 6)

    ctx.fillStyle = randomColor
    ctx.fillRect(0, 0, 400, 400)

    ctx.fillStyle = "white"
    ctx.font = "bold 24px Arial"
    ctx.fillText("NFT #" + randomId, 100, 200)

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Error al generar la imagen"))
        const fileName = `nft-${randomId}`
        const file = new File([blob], `${fileName}.png`, { type: "image/png" })
        const imageUrl = URL.createObjectURL(blob)
        resolve({ file, imageUrl, fileName, blob })
      }, "image/png")
    })
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type !== "image/png") {
        showError("Solo se permiten archivos PNG")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("El archivo debe ser menor a 5MB")
        return
      }

      setSelectedFile(file)
      const imageUrl = URL.createObjectURL(file)
      setPreviewUrl(imageUrl)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect({ target: { files: [file] } })
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleMint = async () => {
    if (!account) {
      showError("Conecta tu wallet primero")
      return
    }

    if (mode === "upload" && !selectedFile) {
      showError("Selecciona un archivo PNG")
      return
    }

    setLoading(true)
    try {
      let file, imageUrl, fileName, blob

      if (mode === "auto") {
        // Usar tu función original de generación
        const generated = await generateImage()
        file = generated.file
        imageUrl = generated.imageUrl
        fileName = generated.fileName
        blob = generated.blob
        setPreviewUrl(imageUrl)
      } else {
        // Modo upload
        const originalName = selectedFile.name.replace(/\.[^/.]+$/, "")
        const uniqueId = uuidv4().slice(0, 6)
        fileName = `${originalName}-${uniqueId}`

        file = selectedFile
        blob = selectedFile

        const newFile = new File([selectedFile], `${fileName}.png`, { type: "image/png" })
        file = newFile
      }

      const contractAddress = await nftContract.getAddress()
      const sizeKB = (blob.size / 1024).toFixed(1) + " KB"

      const metadata = {
        name: nftName || `NFT ${fileName}`,
        description:
          nftDescription ||
          (mode === "auto" ? "Generado localmente sin IPFS" : "NFT personalizado subido por el usuario"),
        image: `${fileName}.png`,
        attributes: [
          { trait_type: "Dimensions", value: mode === "auto" ? "400x400" : "Custom" },
          { trait_type: "File Size", value: sizeKB },
          { trait_type: "Type", value: mode === "auto" ? "Generated" : "Uploaded" },
          { trait_type: "Blockchain", value: "Hardhat (localhost)" },
          { trait_type: "Token Standard", value: "ERC-721" },
          { trait_type: "Contract Address", value: contractAddress },
        ],
      }

      // Enviar al servidor backend para guardar en /public/nfts
      const formData = new FormData()
      formData.append("files", file)
      formData.append(
        "files",
        new File([JSON.stringify(metadata, null, 2)], `${fileName}.json`, { type: "application/json" }),
      )

      const uploadRes = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Error al subir los archivos al servidor local")

      const tokenURI = `${window.location.origin}/nfts/${fileName}.json`
      console.log("📄 tokenURI simulado:", tokenURI)

      const mintPrice = await nftContract.mintPrice()
      const mintTx = await nftContract.mintNFT(tokenURI, { value: mintPrice })
      const receipt = await mintTx.wait()

      // Buscar el evento Transfer para obtener el tokenId
      let tokenId
      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          })

          if (parsedLog && parsedLog.name === "Transfer") {
            tokenId = parsedLog.args.tokenId.toString()
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!tokenId) {
        tokenId = ((await nftContract.nextTokenId()) - 1).toString()
      }

      const auctionAddress = await auctionManagerContract.getAddress()
      const approveTx = await nftContract.approve(auctionAddress, tokenId)
      await approveTx.wait()

      showSuccess(`✅ NFT #${tokenId} minteado y aprobado para subasta`)
      navigate(`/create-auction/${tokenId}`)
    } catch (err) {
      console.error("❌ Error mint local:", err)
      showError("Error al mintear o aprobar el NFT local.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-lime-400 to-blue-400 rounded-lg flex items-center justify-center glow-lime-soft">
          <Palette className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-light text-white">Mintear NFT</h3>
          <p className="text-gray-400 text-sm font-light">Crea y aprueba un NFT único (guardado en /public/nfts)</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setMode("auto")
              setPreviewUrl(null)
              setSelectedFile(null)
            }}
            className={`flex-1 p-4 rounded-lg border transition-all duration-200 ${
              mode === "auto"
                ? "bg-lime-500/20 border-lime-500/50 text-lime-400"
                : "bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-light">Generar Automático</span>
            </div>
          </button>
          <button
            onClick={() => {
              setMode("upload")
              setPreviewUrl(null)
              setSelectedFile(null)
            }}
            className={`flex-1 p-4 rounded-lg border transition-all duration-200 ${
              mode === "upload"
                ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                : "bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5" />
              <span className="font-light">Subir Archivo</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Action */}
        <div className="space-y-4">
          {mode === "auto" ? (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-light">Generación automática</span>
              </div>
              <p className="text-gray-400 text-sm">
                Se creará un NFT único con metadatos y se aprobará automáticamente para subastas.
              </p>
            </div>
          ) : (
            <>
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="p-6 border-2 border-dashed border-purple-500/30 rounded-lg bg-purple-500/5 hover:border-purple-500/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-input").click()}
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-400 font-light mb-2">
                    {selectedFile ? selectedFile.name : "Arrastra tu archivo PNG aquí"}
                  </p>
                  <p className="text-gray-500 text-sm">o haz clic para seleccionar (máx. 5MB)</p>
                </div>
                <input id="file-input" type="file" accept=".png" onChange={handleFileSelect} className="hidden" />
              </div>

              {/* NFT Metadata */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del NFT (opcional)"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <textarea
                  placeholder="Descripción del NFT (opcional)"
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
              </div>
            </>
          )}

          <button
            onClick={handleMint}
            disabled={!account || loading || (mode === "upload" && !selectedFile)}
            className="w-full bg-gradient-to-r from-lime-500 to-blue-500 hover:from-lime-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-light py-4 px-6 rounded-lg transition-all duration-200 glow-lime-soft hover:glow-lime disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Mintear y Aprobar</span>
              </div>
            )}
          </button>

          {!account && (
            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-light">Conecta tu wallet para continuar</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          {previewUrl ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-lime-400" />
                <h4 className="text-lg font-light text-lime-400">
                  {mode === "auto" ? "NFT Generado" : "Archivo Seleccionado"}
                </h4>
              </div>
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="NFT Preview"
                  className="w-full h-auto rounded-xl border border-lime-500/30 glow-lime-soft"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-lime-500/20 backdrop-blur-sm rounded-full p-2">
                    {mode === "auto" ? (
                      <Sparkles className="w-4 h-4 text-lime-400" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-lime-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Palette className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 font-light">Vista previa del NFT</p>
                <p className="text-gray-500 text-sm">
                  {mode === "auto"
                    ? "Se mostrará aquí una vez generado"
                    : "Selecciona un archivo PNG para ver la vista previa"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MintNFT
