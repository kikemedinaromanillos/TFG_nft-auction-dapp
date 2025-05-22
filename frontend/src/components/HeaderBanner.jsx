import { useWeb3 } from "../Web3Context";
import "../styles/HeaderBanner.css"; // estilos aparte para personalizar

const HeaderBanner = () => {
  const { account, connectWallet, disconnectWallet  } = useWeb3();

  return (
    <header className="header-banner">
      <div className="logo">
        <img src="/logo-dark.svg" alt="NFT Auction" />
      </div>

      <div className="center">
        <h2>Subasta de NFTs</h2>
      </div>

      <div className="right">
      {account ? (
        <>
          <div className="nav-item my-auctions-link">
            <a href="/my-auctions">📦 Mis Subastas</a>
          </div>
          <span className="connected">🟢 {account.slice(0, 6)}...{account.slice(-4)}</span>
          <button onClick={disconnectWallet} className="disconnect-btn">Desconectar</button>
        </>
      ) : (
        <button onClick={connectWallet}>Conectar Wallet</button>
      )}
      </div>
    </header>
  );
};

export default HeaderBanner;
