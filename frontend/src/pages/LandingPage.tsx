import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className={`relative z-10 text-center max-w-5xl mx-auto px-6 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
          RoleAI
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-300 mb-4 font-light max-w-3xl mx-auto leading-relaxed">
          Intelligent conversations with AI characters
        </p>
        
        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
          Choose your role, select your model, and engage in meaningful dialogue powered by advanced AI
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Link
            to="/login"
            className="group relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link
            to="/signup"
            className="group bg-slate-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-medium border-2 border-slate-700 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5"
          >
            Create Account
          </Link>
        </div>

        {/* Features */}
        <div className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/70 hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Conversations</h3>
            <p className="text-slate-400 text-sm">Engage with AI that understands context and adapts to your style</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/70 hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-indigo-500/20">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multiple Roles</h3>
            <p className="text-slate-400 text-sm">Choose from various AI characters tailored to your needs</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/70 hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-purple-500/20">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Responses</h3>
            <p className="text-slate-400 text-sm">Get fast, relevant answers powered by cutting-edge AI models</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;