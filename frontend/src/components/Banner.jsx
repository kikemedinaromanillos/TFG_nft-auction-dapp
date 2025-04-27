import { useWeb3 } from "../Web3Context";
import "../styles/Banner.css";

const Banner = () => {
  const { account, connectWallet } = useWeb3();

  return (
    <div className="banner">
      <div className="banner-section logo">
        <img src="/logo-dark.svg" alt="Logo" height="32" />
      </div>

      <div className="banner-section search">
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>

      <nav className="banner-section nav">
        <ul className="nav-list">
          <li>ARTIST</li>
          <li>EXPLORE</li>
          <li>FEED</li>
          <li>TRENDING</li>
          <li>CURATION</li>
        </ul>
      </nav>

      <div className="banner-section right">
        <button className="theme-toggle">🌓</button>
    </div>

    <div className="banner-section wallet">
        {account ? (
            <button className="wallet-button">
            {account.slice(0, 6)}...{account.slice(-4)}
            </button>
        ) : (
            <button className="wallet-button" onClick={connectWallet}>
            Connect Wallet
            </button>
        )}
    </div>
    </div>
  );
};

export default Banner;
