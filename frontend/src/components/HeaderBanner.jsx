import { useWeb3 } from "../Web3Context";
import { Link } from "react-router-dom";
import "../styles/HeaderBanner.css";

const HeaderBanner = () => {
  const { account, connectWallet, disconnectWallet } = useWeb3();

  return (
    <header className="header-banner dark">
      <div className="header-left">
        <Link to="/" className="logo">
          <img src="/logo-dark.svg" alt="NFT Auction" />
        </Link>
      </div>

      <nav className="header-center">
        <Link to="/">Inicio</Link>
        <Link to="/my-nfts">Mis NFTs</Link>
        <Link to="/my-auctions">Mis Subastas</Link>
      </nav>

      <div className="header-right">
        {account ? (
          <>
            <span className="wallet-address">
              🟢 {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button className="wallet-btn" onClick={disconnectWallet}>Desconectar</button>
          </>
        ) : (
          <button className="wallet-btn" onClick={connectWallet}>Conectar Wallet</button>
        )}
      </div>
    </header>
  );
};

export default HeaderBanner;
