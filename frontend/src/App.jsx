import './styles/App.css';
import HeaderBanner from "./components/HeaderBanner";
import MintNFT from "./components/MintNFT";
import ApproveNFT from "./components/ApproveNFT";
import CreateAuction from "./components/CreateAuction";
import AuctionList from "./components/AuctionList";
import BidAuction from "./components/BidAuction";
import FinalizeAuction from "./components/FinalizeAuction";
import MyAuctions from "./components/MyAuctions";
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <HeaderBanner />
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          <Route path="/" element={
            <>
              <MintNFT />
              <ApproveNFT />
              <CreateAuction />
              <AuctionList />
            </>
          } />
          <Route path="/auction/:id" element={<BidAuction />} />
          <Route path="/auction/:id/finalize" element={<FinalizeAuction />} />
          <Route path="/my-auctions" element={<MyAuctions />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
