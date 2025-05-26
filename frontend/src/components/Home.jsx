import AuctionList from "./AuctionList";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container dark">
      <section className="intro-section">
        <h1>Bienvenido a NFT Auction</h1>
        <p>
          Plataforma descentralizada para crear, subastar y pujar por NFTs de forma segura y transparente.
          Conecta tu wallet, crea tus NFTs y participa en subastas en tiempo real.
        </p>
      </section>

      <section className="auction-section">
        <AuctionList />
      </section>
    </div>
  );
};

export default Home;
