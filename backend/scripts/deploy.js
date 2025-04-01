const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Desplegamos NFTCollection
  const NFTCollectionFactory = await hre.ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollectionFactory.deploy();
  await nftCollection.waitForDeployment();
  
  const nftCollectionAddress = await nftCollection.getAddress();
  console.log("NFTCollection deployed at:", nftCollectionAddress);

  // Minteamos un NFT para subastar
  const mintPrice = await nftCollection.mintPrice();
  const tokenURI = "ipfs://Qm..."; // Reemplazar con un tokenURI real
  const mintTx = await nftCollection.mintNFT(tokenURI, { value: mintPrice });
  await mintTx.wait();
  console.log("NFT minted!");

  // Asignamos el ID del NFT minteado
  const nftId = 0;

  // Aprobamos el NFT antes de desplegar la subasta
  console.log(`Approving NFT ${nftId} for the auction contract...`);
  const approvalTx = await nftCollection.approve(deployer.address, nftId);
  await approvalTx.wait();
  console.log(`NFT ${nftId} approved for the auction contract.`);

  // Desplegamos el contrato de subasta
  const EnglishAuctionFactory = await hre.ethers.getContractFactory("EnglishAuction");
  const englishAuction = await EnglishAuctionFactory.deploy(
    nftCollectionAddress,
    nftId,
    hre.ethers.parseEther("0.01"), // Puja inicial
    86400, // Duración 1 día
    deployer.address // Plataforma
  );

  await englishAuction.waitForDeployment();
  
  const auctionAddress = await englishAuction.getAddress();
  console.log("EnglishAuction deployed at:", auctionAddress);

  // transferimos el NFT a la subasta
  console.log(`Transferring NFT ${nftId} to the auction contract...`);
  const transferTx = await nftCollection.transferFrom(deployer.address, auctionAddress, nftId);
  await transferTx.wait();
  console.log(`NFT ${nftId} transferred to the auction contract.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
