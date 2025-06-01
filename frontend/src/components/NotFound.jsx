"use client"

import { Link } from "react-router-dom"
import { Home, AlertTriangle, ArrowLeft } from "lucide-react"

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Background Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-pink-500/20 blur-3xl"></div>

          <div className="relative glass-card p-12">
            {/* 404 Icon */}
            <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-8 glow-orange-soft">
              <AlertTriangle className="w-12 h-12 text-orange-400" />
            </div>

            {/* 404 Text */}
            <h1 className="text-8xl md:text-9xl font-thin mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              404
            </h1>

            {/* Error Message */}
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">Página no encontrada</h2>

            <p className="text-gray-400 font-light text-lg mb-8 max-w-md mx-auto">
              Oops... La página que estás buscando no existe en el metaverso. Puede que haya sido transferida a otra
              blockchain.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-lime-500 to-blue-500 hover:from-lime-600 hover:to-blue-600 text-white font-light py-4 px-8 rounded-lg transition-all duration-200 glow-lime-soft hover:glow-lime">
                  <Home className="w-5 h-5" />
                  <span>Volver al inicio</span>
                </button>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 hover:text-white border border-purple-500/30 py-4 px-8 rounded-lg transition-all duration-200 font-light"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Página anterior</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
              <p className="text-gray-500 text-sm">Si crees que esto es un error, contacta con el soporte técnico</p>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-lime-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-6 h-6 bg-purple-400/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  )
}

export default NotFound
