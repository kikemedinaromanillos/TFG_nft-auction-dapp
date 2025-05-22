import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTCollectionABI from "./contracts/NFTCollection.json";
import AuctionManagerABI from "./contracts/AuctionManager.json";
import deployments from "./contracts/deployments.json";

const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [auctionManagerContract, setAuctionManagerContract] = useState(null);

  const NFT_CONTRACT_ADDRESS = deployments.NFTCollection;
  const AUCTION_MANAGER_ADDRESS = deployments.AuctionManager;

  // 🔁 Auto-reconexión
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const nftInstance = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTCollectionABI.abi, signer);
          const auctionInstance = new ethers.Contract(AUCTION_MANAGER_ADDRESS, AuctionManagerABI.abi, signer);

          setAccount(accounts[0]);
          setNftContract(nftInstance);
          setAuctionManagerContract(auctionInstance);
        }
      }
    };

    init();
  }, []);

  // 🔁 Listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  // 🔌 Conectar
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask no está instalado.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const nftInstance = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTCollectionABI.abi, signer);
    const auctionInstance = new ethers.Contract(AUCTION_MANAGER_ADDRESS, AuctionManagerABI.abi, signer);

    setAccount(accounts[0]);
    setNftContract(nftInstance);
    setAuctionManagerContract(auctionInstance);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setNftContract(null);
    setAuctionManagerContract(null);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        nftContract,
        auctionManagerContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// ✅ Hook exportado como función nombrada
function useWeb3() {
  return useContext(Web3Context);
}

export { Web3Provider, useWeb3 };
