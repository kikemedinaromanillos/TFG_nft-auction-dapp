import './styles/App.css';
import { useWeb3 } from './Web3Context';
import Banner from './components/Banner';
import AuctionCard from './components/AuctionCard';
import MintNFT from "./components/MintNFT";
import ApproveNFT from "./components/ApproveNFT";
import CreateAuction from "./components/CreateAuction";
import TransferNFT from "./components/TransferNFT";
import BidAuction from "./components/BidAuction";
import FinalizeAuction from "./components/FinalizeAuction";

function App() {
  const { account, nftContract, auctionContract } = useWeb3();

  return (
    <div className="container">
      <Banner />

      {!account && <p style={{ textAlign: "center" }}>Conecta tu wallet para comenzar</p>}

      {account && (
        <main>
          <MintNFT />
          <ApproveNFT />
          <CreateAuction />
          <TransferNFT />
          <BidAuction />
          <FinalizeAuction />
        </main>
      )}
    </div>
  );
}

export default App;
