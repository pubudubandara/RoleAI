import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as chatSessionApi from '../api/chatSessionApi';
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(email, password);
      // After login, redirect to /chat/{chatId}
      try {
        const sessions = await chatSessionApi.listSessions();
        if (sessions.length > 0) {
          navigate(`/chat/${sessions[0].id}`);
        } else {
          const created = await chatSessionApi.createSession();
          navigate(`/chat/${created.id}`);
        }
      } catch (e) {
        // Fallback
        navigate('/chat');
      }
    } catch (error) {
      // Handle login error, e.g., show a message
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        <div className="text-center mb-8">
          <h2 className="mt-6 text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-slate-400">Sign in to continue to RoleAI</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl"
        >
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800"
                disabled={isLoading}
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-700 disabled:to-slate-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-500">New to RoleAI?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link 
              to="/signup" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Create an account
            </Link>
          </div>
        </form>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;