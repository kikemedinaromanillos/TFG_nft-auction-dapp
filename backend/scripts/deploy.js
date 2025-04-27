const hre = require("hardhat");

async function main() {
  const [deployer, user] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Desplegar NFTCollection
  const NFTCollectionFactory = await hre.ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollectionFactory.connect(deployer).deploy();
  await nftCollection.waitForDeployment();
  const nftCollectionAddress = await nftCollection.getAddress();
  console.log("NFTCollection deployed at:", nftCollectionAddress);

  // 2. Mintear NFT
  const mintPrice = await nftCollection.mintPrice();
  const tokenURI = "ipfs://Qm..."; // Reemplazar con real
  const mintTx = await nftCollection.connect(user).mintNFT(tokenURI, { value: mintPrice });
  await mintTx.wait();
  console.log("✅ NFT minted by user");

  const nftId = 0;

  // 3. Desplegar subasta
  const EnglishAuctionFactory = await hre.ethers.getContractFactory("EnglishAuction");
  const englishAuction = await EnglishAuctionFactory.connect(user).deploy(
    nftCollectionAddress,
    nftId,
    hre.ethers.parseEther("0.01"),
    86400,
    deployer.address
  );
  await englishAuction.waitForDeployment();
  const auctionAddress = await englishAuction.getAddress();
  console.log("EnglishAuction deployed at:", auctionAddress);

  // 4. Aprobar NFT para la subasta
  console.log(`🔒 Approving NFT ${nftId} for auction contract...`);
  const approvalTx = await nftCollection.connect(user).approve(auctionAddress, nftId);
  await approvalTx.wait();

  // 5. Transferir NFT al contrato de subasta
  const transferTx = await nftCollection.connect(user).transferFrom(user.address, auctionAddress, nftId);
  await transferTx.wait();
  console.log(`✅ NFT ${nftId} transferred to the auction contract`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
