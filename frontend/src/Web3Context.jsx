import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTCollectionABI from "./contracts/NFTCollection.json";
import EnglishAuctionABI from "./contracts/EnglishAuction.json";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [nftContract, setNftContract] = useState(null);
    const [auctionContract, setAuctionContract] = useState(null);

    const NFT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const AUCTION_CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

    // 🔹 Conectar MetaMask
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask no está instalado.");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        const nftInstance = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTCollectionABI.abi, signer);
        const auctionInstance = new ethers.Contract(AUCTION_CONTRACT_ADDRESS, EnglishAuctionABI.abi, signer);

        setAccount(accounts[0]);
        setNftContract(nftInstance);
        setAuctionContract(auctionInstance);
    };

    return (
        <Web3Context.Provider value={{ account, connectWallet, nftContract, auctionContract }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => useContext(Web3Context);
