"use client"

import { useWeb3 } from "../Web3Context"
import { Link } from "react-router-dom"
import { Wallet, Home, ImageIcon, Gavel, Menu, X } from "lucide-react"
import { useState } from "react"

const HeaderBanner = () => {
  const { account, connectWallet, disconnectWallet } = useWeb3()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900/30 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-lime-400 to-blue-400 rounded-lg flex items-center justify-center glow-lime-soft group-hover:glow-lime transition-all duration-200">
              <ImageIcon className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-light bg-gradient-to-r from-lime-400 to-blue-400 bg-clip-text text-transparent hidden sm:block">
              Mint & Bid
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-lime-400 transition-colors font-light"
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <Link
              to="/my-nfts"
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors font-light"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Mis NFTs</span>
            </Link>
            <Link
              to="/my-auctions"
              className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors font-light"
            >
              <Gavel className="w-4 h-4" />
              <span>Mis Subastas</span>
            </Link>
          </nav>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-lime-500/20 px-4 py-2 rounded-lg glow-lime-soft">
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
                  <span className="text-lime-400 font-mono text-sm">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors font-light"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 font-light glow-purple-soft hover:glow-purple"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:block">Conectar Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <nav className="space-y-3">
              <Link
                to="/"
                className="flex items-center space-x-3 text-gray-400 hover:text-lime-400 transition-colors font-light p-2 rounded-lg hover:bg-gray-800/30"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>
              <Link
                to="/my-nfts"
                className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-colors font-light p-2 rounded-lg hover:bg-gray-800/30"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Mis NFTs</span>
              </Link>
              <Link
                to="/my-auctions"
                className="flex items-center space-x-3 text-gray-400 hover:text-purple-400 transition-colors font-light p-2 rounded-lg hover:bg-gray-800/30"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Gavel className="w-4 h-4" />
                <span>Mis Subastas</span>
              </Link>

              {account && (
                <div className="flex items-center space-x-2 bg-lime-500/20 px-3 py-2 rounded-lg glow-lime-soft mt-4">
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
                  <span className="text-lime-400 font-mono text-sm">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default HeaderBanner
