# 🏆 NFT Auction DApp - Hardhat Setup

Este proyecto es una **DApp de subastas de NFT y tokens**. Aquí se documentan los pasos seguidos hasta el momento para configurar **Hardhat**, compilar y desplegar contratos inteligentes en una red local.

---

## 📌 **1. Requisitos previos**
Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 16 o superior recomendada)
- [VS Code](https://code.visualstudio.com/) (opcional pero recomendado)
- Extensión **Solidity** en VS Code (para resaltar sintaxis)

---

## 🚀 **2. Configuración del Proyecto en Hardhat**
### 🔹 **Crear el Proyecto**
Ejecuta los siguientes comandos en tu terminal:

```bash
mkdir nft-auction-dapp
cd nft-auction-dapp
npm init -y
npm install --save-dev hardhat
```
Luego, incializa Hardhat:

```bash
npx hardhat
```

Selecciona "Create a JavaScript project" y acepta las opciones por defecto.

### 🔹 **Instalar Dependencias**

```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox dotenv
npm install @openzeppelin/contracts
```
## 🛠️ **3. Configuración de Hardhat**

Edita el archivo `hardhat.config.js` para asegurarte de que usa Solidity 0.8.20:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {}, // Red local de Hardhat
  },
};
```
## 📝 **4. Crear y Compilar un Contrato**

Crea la carpeta `contracts/` y dentro el archivo `HelloWorld.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    string public message = "Hello, Hardhat!";

    function setMessage(string calldata _message) external {
        message = _message;
    }
}
```

### Compilar el contrato

```bash
npx hardhat compile
```

Si ves `Compilation finished successfully`, ¡todo está bien! 🎉

## 📡 **5. Desplegar en la Red Local**
### 🔹 **Levantar la blockchain local**

```bash
npx hardhat node
```

Esto iniciará un nodo de Ethereum en `http://127.0.0.1:8545/`.


### 🔹 **Crear un Script de Despliegue**
Crea la carpeta `scripts/` y dentro `deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("HelloWorld");
  const contract = await Contract.deploy();
  
  await contract.waitForDeployment();

  console.log(`Contract deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 🔹 **Desplegar el Contrato**
Ejecuta el siguiente comando en otra terminal (mientras el nodo está corriendo):

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Si todo sale bien, verás un mensaje con la dirección del contrato:

```bash
Deploying contract with the account: 0xf39Fd6...
Contract deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

## 🖥️ **6. Interactuar con el Contrato**
Abre la consola de Hardhat:

```bash
npx hardhat console --network localhost
```
Prueba interactuar con el contrato:

```javascript
const [owner] = await ethers.getSigners();
const Contract = await ethers.getContractFactory("HelloWorld");
const contract = await Contract.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

// Leer el mensaje
await contract.message();

// Cambiar el mensaje
await contract.setMessage("Hola Blockchain!");

// Verificar el nuevo mensaje
await contract.message();
```

Si devuelve `'Hola Blockchain!'`, significa que el contrato funciona correctamente. ✅

# --------------------------------------------------------
# --------------------------------------------------------

# 🧪 Pruebas del Flujo de Subasta con NFT creado por un Usuario en Hardhat Console

## 1️⃣ Conectar las Cuentas y los Contratos

### Obtener cuentas
```javascript
const [deployer, user, bidder1, bidder2] = await ethers.getSigners();
```
📌 `user` = Creador del NFT (vendedor)  
📌 `bidder1` y `bidder2` = Postores  
📌 `deployer` = Plataforma (cobra comisión)

### Conectar contratos
```javascript
const NFTCollection = await ethers.getContractFactory("NFTCollection");
const nftCollection = await NFTCollection.attach("DIRECCION_DEL_CONTRATO_NFT");

const EnglishAuction = await ethers.getContractFactory("EnglishAuction");
const auction = await EnglishAuction.attach("DIRECCION_DEL_CONTRATO_AUCTION");
```
---
## 3️⃣ Verificar Estado de Subasta
```javascript
await auction.highestBid();
await auction.highestBidder();
await auction.auctionEndTime();
```

---
## 4️⃣ Realizar Pujas

### Bidder1 ofrece 0.02 ETH
```javascript
await auction.connect(bidder1).bid({ value: ethers.parseEther("0.02") });
```
Verificar:
```javascript
await auction.highestBid();
await auction.highestBidder();
```

### Bidder2 ofrece 0.05 ETH
```javascript
await auction.connect(bidder2).bid({ value: ethers.parseEther("0.05") });
```
Verificar:
```javascript
await auction.highestBid();
await auction.highestBidder();
```

---
## 5️⃣ Verificar Balances tras Pujas
```javascript
ethers.formatEther(await ethers.provider.getBalance(bidder1.address));
ethers.formatEther(await ethers.provider.getBalance(bidder2.address));
ethers.formatEther(await ethers.provider.getBalance(user.address));
```

---
## 6️⃣ Finalizar Subasta
### Avanzar el tiempo:
```javascript
await network.provider.send("evm_increaseTime", [86400]);
await network.provider.send("evm_mine");
```
### Finalizar:
```javascript
await auction.connect(user).finalizeAuction();
```

---
## 7️⃣ Verificar Resultados Finales
```javascript
ethers.formatEther(await ethers.provider.getBalance(bidder1.address));
ethers.formatEther(await ethers.provider.getBalance(bidder2.address));
ethers.formatEther(await ethers.provider.getBalance(user.address));
ethers.formatEther(await ethers.provider.getBalance(deployer.address));
```

### Verificar propiedad del NFT:
```javascript
await nftCollection.ownerOf(0);
```
✅ Debe ser `bidder2`

