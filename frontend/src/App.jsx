import "./styles/App.css";
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

function App() {
  return (
    <>
      <HeaderBanner />
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          {/* Página principal con portada y subastas activas */}
          <Route path="/" element={<Home />} />

          {/* NFTs del usuario: listado y opción de mintear */}
          <Route path="/my-nfts" element={<MyNFTs />} />

          {/* Subastas creadas por el usuario: activas y finalizadas */}
          <Route path="/my-auctions" element={<MyAuctions />} />

          {/* Crear subasta a partir de un tokenId */}
          <Route path="/create-auction/:tokenId" element={<CreateAuction />} />

          {/* Ver y pujar por una subasta */}
          <Route path="/auction/:id" element={<BidAuction />} />

          {/* Finalizar subasta (si eres el creador y ya terminó) */}
          <Route path="/auction/:id/finalize" element={<FinalizeAuction />} />

          {/* Ruta por defecto para manejar 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </>
  );
}

export default App;
