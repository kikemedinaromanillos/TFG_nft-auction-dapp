const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const NFTFactory = await hre.ethers.getContractFactory("NFTCollection");
  const nft = await NFTFactory.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();

  const AuctionFactory = await hre.ethers.getContractFactory("AuctionManager");
  const auction = await AuctionFactory.deploy(deployer.address); // deployer será la wallet que recibe la comisión
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();

  console.log("✅ Contracts deployed:");
  console.log("NFTCollection:", nftAddress);
  console.log("AuctionManager:", auctionAddress);

  // Rutas frontend
  const frontContractsPath = path.resolve(__dirname, "../../frontend/src/contracts");

  // Crear directorio si no existe
  if (!fs.existsSync(frontContractsPath)) {
    fs.mkdirSync(frontContractsPath, { recursive: true });
  }

  // Guardar direcciones
  const deployments = {
    NFTCollection: nftAddress,
    AuctionManager: auctionAddress,
  };
  fs.writeFileSync(
    path.join(frontContractsPath, "deployments.json"),
    JSON.stringify(deployments, null, 2)
  );

  // Guardar ABIs
  const nftArtifact = await hre.artifacts.readArtifact("NFTCollection");
  const auctionArtifact = await hre.artifacts.readArtifact("AuctionManager");

  fs.writeFileSync(path.join(frontContractsPath, "NFTCollection.json"), JSON.stringify(nftArtifact, null, 2));
  fs.writeFileSync(path.join(frontContractsPath, "AuctionManager.json"), JSON.stringify(auctionArtifact, null, 2));

  console.log("✅ Artifacts and addresses saved to frontend/src/contracts/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
