import React from "react";
import Footer from "./Footer";
import { FiShield } from "react-icons/fi";
import BackgroundImage from "../../assets/images/lingga-mountain.jpg";

const AuthLayout = ({ children }) => {
  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay for better readability and professional look */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-800/65 to-slate-900/70"></div>

      {/* Animated Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle accent lines for professional touch */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20"></div>
      </div>

      {/* Header Bar */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition duration-300">
              <FiShield className="text-white text-lg" />
            </div>
            <div className="text-center">
              <h1 className="text-sm font-bold text-white drop-shadow-md">
                Telegram Sanapati
              </h1>
              <p className="text-xs text-blue-100">Kabupaten Lingga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-20 flex flex-1 justify-center items-center px-4">
        <div className="w-full max-w-md">
          {/* Content wrapper with glass-morphism effect */}
          <div className="backdrop-blur-sm">{children}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;
