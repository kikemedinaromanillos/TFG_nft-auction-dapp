// import "./styles/App.css";  ← ELIMINA esta línea
import HeaderBanner from "./components/HeaderBanner";
import Home from "./components/Home";
import MyNFTs from "./components/MyNFTs";
import MyAuctions from "./components/MyAuctions";
import CreateAuction from "./components/CreateAuction";
import BidAuction from "./components/BidAuction";
import FinalizeAuction from "./components/FinalizeAuction";
import NotFound from "./components/NotFound";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import './styles/globals.css'  ← ELIMINA esta línea (ya está en main.jsx)

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderBanner />
      <div className="App">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="dark"
          toastClassName="glass-card"
          bodyClassName="text-white"
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-nfts" element={<MyNFTs />} />
          <Route path="/my-auctions" element={<MyAuctions />} />
          <Route path="/create-auction/:tokenId" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<BidAuction />} />
          <Route path="/auction/:id/finalize" element={<FinalizeAuction />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;