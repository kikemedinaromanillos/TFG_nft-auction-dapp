import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './styles/App.css';
import { useWeb3 } from './Web3Context';
import Banner from './components/Banner';  
import AuctionCard from './components/AuctionCard'; 

function App() {
  const { account } = useWeb3();

  return (
    <>
      <Banner />

      { account && (
        <div className="content">
          <h1>¡Bienvenido a tu Marketplace de Criptos y NFTs!</h1>
          <p>Compra, vende y subasta tus activos digitales de forma descentralizada.</p>
          <AuctionCard />
        </div>
      )}
    </>
  );
}

export default App;
