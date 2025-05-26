import { useState } from "react";
import { useWeb3 } from "../Web3Context";
import { useToast } from "../hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "../styles/MintNFT.css";

const MintNFT = () => {
  const { nftContract, auctionManagerContract, account } = useWeb3();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const generateImage = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    const randomId = uuidv4().slice(0, 6);

    ctx.fillStyle = randomColor;
    ctx.fillRect(0, 0, 400, 400);

    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.fillText("NFT #" + randomId, 100, 200);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Error al generar la imagen"));
        const fileName = `nft-${randomId}`;
        const file = new File([blob], `${fileName}.png`, { type: "image/png" });
        const imageUrl = URL.createObjectURL(blob);
        resolve({ file, imageUrl, fileName, blob });
      }, "image/png");
    });
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMint = async () => {
    setLoading(true);
    try {
      const { file, imageUrl, fileName, blob } = await generateImage();
      setPreviewUrl(imageUrl);

      // 1. Descargar imagen
      downloadFile(file, `${fileName}.png`);

      // 2. Crear metadata enriquecido
      const contractAddress = await nftContract.getAddress();
      const sizeKB = (blob.size / 1024).toFixed(1) + " KB";

      const metadata = {
        name: `NFT ${fileName}`,
        description: "Generado localmente sin IPFS",
        image: `${fileName}.png`,
        attributes: [
          { trait_type: "Dimensions", value: "400x400" },
          { trait_type: "File Size", value: sizeKB },
          { trait_type: "Blockchain", value: "Hardhat (localhost)" },
          { trait_type: "Token Standard", value: "ERC-721" },
          { trait_type: "Contract Address", value: contractAddress }
        ]
      };

      const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: "application/json",
      });

      // 3. Descargar metadata
      downloadFile(jsonBlob, `${fileName}.json`);

      // 4. Crear un tokenURI simulado
      const tokenURI = `${window.location.origin}/nfts/${fileName}.json`;
      console.log("📄 tokenURI simulado:", tokenURI);

      // 5. Mintear usando contrato y MetaMask
      const mintPrice = await nftContract.mintPrice();
      const mintTx = await nftContract.mintNFT(tokenURI, { value: mintPrice });
      const receipt = await mintTx.wait();

      const transferEvent = receipt.logs.find(log => log.fragment?.name === "Transfer");
      const tokenId = transferEvent?.args?.tokenId?.toString();

      if (!tokenId) throw new Error("No se pudo obtener el tokenId");

      const auctionAddress = await auctionManagerContract.getAddress();
      const approveTx = await nftContract.approve(auctionAddress, tokenId);
      await approveTx.wait();

      showSuccess(`✅ NFT #${tokenId} minteado y aprobado para subasta`);
      navigate(`/create-auction/${tokenId}`);

    } catch (err) {
      console.error("❌ Error mint local:", err);
      showError("Error al mintear o aprobar el NFT local.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mint-container">
      <h3>Mintear y aprobar NFT (local sin IPFS)</h3>
      <button onClick={handleMint} disabled={!account || loading}>
        {loading ? "Procesando..." : "Mintear y Aprobar"}
      </button>

      {previewUrl && (
        <div className="preview-container">
          <h4>🖼️ Previsualización del NFT</h4>
          <img
            src={previewUrl}
            alt="NFT Preview"
            width="300"
            style={{ borderRadius: "8px", marginTop: "10px" }}
          />
        </div>
      )}
    </div>
  );
};

export default MintNFT;
