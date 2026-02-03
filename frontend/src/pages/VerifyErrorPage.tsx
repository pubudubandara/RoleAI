import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const VerifyErrorPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-slate-950 relative overflow-hidden p-6">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-red-500/20">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
            <p className="text-slate-300 mb-6">
              The verification link is invalid or has expired. Please try signing up again or request a new verification email.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              to="/signup"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 inline-block"
            >
              Sign Up Again
            </Link>
            
            <Link
              to="/login"
              className="w-full bg-slate-800/50 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-medium border-2 border-slate-700 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 hover:shadow-lg inline-block"
            >
              Try Login
            </Link>
          </div>
          
          <div className="mt-4">
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyErrorPage;