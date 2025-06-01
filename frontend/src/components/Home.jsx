import AuctionList from "./AuctionList"
import { Zap, TrendingUp, Shield, Users } from "lucide-react"

const Home = () => {
  const features = [
    {
      icon: Zap,
      title: "Rápido y Seguro",
      description: "Transacciones instantáneas con tecnología blockchain",
      color: "lime",
    },
    {
      icon: TrendingUp,
      title: "Subastas en Tiempo Real",
      description: "Participa en subastas dinámicas con actualizaciones en vivo",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Totalmente Descentralizado",
      description: "Sin intermediarios, tú tienes el control total",
      color: "purple",
    },
    {
      icon: Users,
      title: "Comunidad Global",
      description: "Conecta con coleccionistas de todo el mundo",
      color: "pink",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 via-blue-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="glass-card p-12">
            <h1 className="text-5xl md:text-7xl font-thin mb-6 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bienvenido a NFT Auction
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
              Plataforma descentralizada para crear, subastar y pujar por NFTs de forma segura y transparente. Conecta
              tu wallet, crea tus NFTs y participa en subastas en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button className="bg-gradient-to-r from-lime-500 to-blue-500 hover:from-lime-600 hover:to-blue-600 text-white font-light py-4 px-8 rounded-lg transition-all duration-200 glow-lime-soft hover:glow-lime">
                Explorar Subastas
              </button>
              <button className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 hover:text-white border border-purple-500/30 py-4 px-8 rounded-lg transition-all duration-200 font-light">
                Crear NFT
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-thin mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-gray-400 font-light text-lg">Tecnología de vanguardia para el futuro de los NFTs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300 group">
                <div
                  className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                    feature.color === "lime"
                      ? "bg-lime-500/20 glow-lime-soft"
                      : feature.color === "blue"
                        ? "bg-blue-500/20 glow-blue-soft"
                        : feature.color === "purple"
                          ? "bg-purple-500/20 glow-purple-soft"
                          : "bg-pink-500/20 glow-pink-soft"
                  }`}
                >
                  <feature.icon
                    className={`w-6 h-6 ${
                      feature.color === "lime"
                        ? "text-lime-400"
                        : feature.color === "blue"
                          ? "text-blue-400"
                          : feature.color === "purple"
                            ? "text-purple-400"
                            : "text-pink-400"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-light text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auctions Section */}
      <section className="pb-16">
        <AuctionList />
      </section>
    </div>
  )
}

export default Home
