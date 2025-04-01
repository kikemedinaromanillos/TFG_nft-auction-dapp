const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("HelloWorld"); // Cambia "MyContract" por el nombre correcto
  const contract = await Contract.deploy(); // Llama a deploy()
  
  await contract.waitForDeployment(); // Esperar confirmación en la blockchain
  
  console.log(`Contract deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
