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

# Pruebas de la Subasta en Hardhat Console

## 1️⃣ Conectar las Cuentas y los Contratos

### Obtener las cuentas de prueba:
```javascript
const [deployer, owner, bidder1, bidder2] = await ethers.getSigners();
```
📌 `owner` = Vendedor (desplegó los contratos)  
📌 `bidder1` y `bidder2` = Usuarios que pujan en la subasta

### Conectar el contrato `NFTCollection`:
```javascript
const NFTCollection = await ethers.getContractFactory("NFTCollection");
const nftCollection = await NFTCollection.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
```

### Conectar el contrato `EnglishAuction`:
```javascript
const EnglishAuction = await ethers.getContractFactory("EnglishAuction");
const auction = await EnglishAuction.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
```

---
## 2️⃣ Verificar el Estado de la Subasta
Ejecuta estos comandos para ver el estado inicial:
```javascript
await auction.highestBid(); // Debería ser 0 al inicio
await auction.highestBidder(); // Debería ser 0x000... si nadie ha pujado
await auction.auctionEndTime(); // Tiempo en el que finaliza la subasta
```

---
## 3️⃣ Realizar Pujas en la Subasta

### 📌 Bidder1 hace una oferta de 0.02 ETH
```javascript
await auction.connect(bidder1).bid({ value: ethers.parseEther("0.02") });
```
🔹 Verificar la oferta más alta después de la puja:
```javascript
await auction.highestBid();
await auction.highestBidder();
```
**Resultado esperado:**
- `highestBid = 0.02 ETH`
- `highestBidder = dirección de bidder1`

### 📌 Bidder2 supera la puja con 0.05 ETH
```javascript
await auction.connect(bidder2).bid({ value: ethers.parseEther("0.05") });
```
🔹 Verificar nuevamente la mejor oferta:
```javascript
await auction.highestBid();
await auction.highestBidder();
```
**Resultado esperado:**
- `highestBid = 0.05 ETH`
- `highestBidder = dirección de bidder2`
- `Bidder1` recupera automáticamente sus 0.02 ETH

---
## 4️⃣ Revisar los Balances Después de las Pujas
Para asegurarnos de que los ETH se han descontado correctamente:
```javascript
ethers.formatEther(await ethers.provider.getBalance(bidder1.address)); // Debería estar casi igual, ya que recuperó su dinero
ethers.formatEther(await ethers.provider.getBalance(bidder2.address)); // Debería haber bajado ~0.05 ETH
ethers.formatEther(await ethers.provider.getBalance(owner.address)); // Debería seguir igual hasta que se finalice la subasta
```

---
## 5️⃣ Finalizar la Subasta
### 📌 Adelantar el tiempo en la red local de Hardhat:
```javascript
await network.provider.send("evm_increaseTime", [86400]); // Avanzar 1 día
await network.provider.send("evm_mine"); // Minar un nuevo bloque
```
🔹 Ahora sí, finaliza la subasta:
```javascript
await auction.finalizeAuction();
```
Esto transferirá el NFT al mejor postor y enviará el pago al vendedor.

---
## 6️⃣ Verificar los Balances Finales
Después de finalizar la subasta, revisa:
```javascript
ethers.formatEther(await ethers.provider.getBalance(bidder1.address)); // Debe ser igual al inicio
ethers.formatEther(await ethers.provider.getBalance(bidder2.address)); // Debe haber bajado 0.05 ETH + fees
ethers.formatEther(await ethers.provider.getBalance(owner.address)); // Debe haber aumentado ~0.0475 ETH (0.05 - comisión)
ethers.formatEther(await ethers.provider.getBalance(deployer.address)); // Debería haber recibido la comisión
```

### 📌 Verificar el nuevo dueño del NFT:
```javascript
await nftCollection.ownerOf(0);
```
**Resultado esperado:** La dirección de `bidder2`, ya que ganó la subasta.
