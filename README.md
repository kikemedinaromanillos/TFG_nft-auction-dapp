# NFT Auction DApp - Plataforma de Subastas de NFTs

Esta aplicación descentralizada permite a los usuarios crear, mintear, listar y pujar por NFTs en subastas en tiempo real. Está desarrollada con Hardhat para el backend de contratos inteligentes, un servidor Node.js para el almacenamiento de archivos, y React con Vite para el frontend.

---

## Requisitos previos

- Node.js (v16 o superior)
- Git (opcional, para clonar el repositorio)
- MetaMask instalado en el navegador
- Extensión de Solidity en VS Code (recomendado para el desarrollo)

---

## Instalación del proyecto

1. Clonar el repositorio:

```bash
git clone https://github.com/usuario/nft-auction.git
cd nft-auction
```

2. Instalar dependencias en los tres módulos:

```bash
cd file-server
npm install

cd ../backend
npm install

cd ../frontend
npm install
```

---

## Activación del entorno

### Terminales separadas

**Terminal 1 – Servidor de archivos -> /file-server**

```bash
cd file-server
node index.js
```

Guarda imágenes `.png` y metadatos `.json` en `/public/nfts` tras crear un NFT.

---

**Terminal 2 – Red local con Hardhat -> /backend**

```bash
cd backend
npx hardhat node
```

Levanta una blockchain local accesible desde `http://localhost:8545`.

---

**Terminal 3 – Frontend -> /frontend**

```bash
cd frontend
npm run dev:full
```

Este comando realiza:

- Despliegue automático de los contratos en la red local de Hardhat
- Guardado de direcciones y ABIs en `frontend/src/contracts`
- Inicio del frontend en `http://localhost:5173`

---

## Simulación de finalización de una subasta

Para poder finalizar una subasta (sin esperar el tiempo real), es posible simular el paso del tiempo:

1. Con `npx hardhat node` en ejecución, abrir la consola:

```bash
cd backend
npx hardhat console --network localhost
```

2. Ejecutar el siguiente código para avanzar 1 día:

```javascript
await network.provider.send("evm_increaseTime", [86400]); // Avanza 1 día
await network.provider.send("evm_mine"); // Mina un nuevo bloque

const auction = await ethers.getContractAt("AuctionManager", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
const subasta = await auction.auctions(0);
subasta.endTime;
(await ethers.provider.getBlock("latest")).timestamp;
```

---

## Descripción general del flujo

1. El usuario puede crear un NFT desde la app.
2. Se genera la imagen y metadatos, que se almacenan localmente.
3. El NFT es minteado y aprobado para subasta.
4. Se crea la subasta especificando el precio inicial.
5. Otros usuarios pueden pujar durante el tiempo activo.
6. Al finalizar, el NFT se transfiere al mejor postor.

---
