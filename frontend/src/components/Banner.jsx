import { useState } from "react";
import "../styles/Banner.css";
import { useWeb3 } from "../Web3Context";
import darkModeIcon from "../assets/dark-theme.svg";
import lightModeIcon from "../assets/light-theme.png";

export default function Banner() {
    const [darkMode, setDarkMode] = useState(true);
    const { account, connectWallet } = useWeb3();

    return (
        <nav className={`banner ${darkMode ? "light" : "dark"}`}>
            <div className="logo">
                <span>💎 SuperRare</span>
            </div>

            <div className="sarch-bar">
                <input type="text" placeholder="Buscar..." />
            </div>

            <div className="nav-links">
                <a href="#">ARTISTS</a>
                <a href="#">EXPLORE</a>
                <a href="#">FEED</a>
                <a href="#">TRENDING</a>
                <a href="#">CURATION</a>
            </div>

            <div className="theme-switcher">
                <button onClick={() => setDarkMode(!darkMode)}>
                <img src={lightModeIcon} alt="Dark Mode" />
                    {/* Logo{darkMode ? <img src={lightModeIcon} alt="Dark Mode" /> : <img src={darkModeIcon} alt="Dark Mode" />}*/}
                </button>
            </div>

            <div className="connect-wallet">
                <button onClick={connectWallet} className="wallet-button">
                    {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect Wallet"}
                </button>
            </div>
        </nav>
    );
}
