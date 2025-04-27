const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer, user] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const NFTCollectionFactory = await hre.ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollectionFactory.connect(deployer).deploy();
  await nftCollection.waitForDeployment();

  const nftCollectionAddress = await nftCollection.getAddress();
  console.log("NFTCollection deployed at:", nftCollectionAddress);

  const EnglishAuctionFactory = await hre.ethers.getContractFactory("EnglishAuction");
  const englishAuction = await EnglishAuctionFactory.connect(deployer).deploy(
    nftCollectionAddress,
    0,
    hre.ethers.parseEther("0.01"),
    86400,
    deployer.address
  );
  await englishAuction.waitForDeployment();

  const auctionAddress = await englishAuction.getAddress();
  console.log("EnglishAuction deployed at:", auctionAddress);

  const deployments = {
    NFTCollection: nftCollectionAddress,
    EnglishAuction: auctionAddress,
  };

  const path = require("path");

  const deploymentsPath = path.resolve(__dirname, "../../frontend/src/contracts/deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  

  console.log("\n Deployments saved to frontend/src/contracts/deployments.json\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
