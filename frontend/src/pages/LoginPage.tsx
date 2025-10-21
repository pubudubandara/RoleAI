import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as chatSessionApi from '../api/chatSessionApi';
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="w-full h-full flex justify-center items-center p-6 bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700"
          disabled={isLoading}
        />
        <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white py-2 rounded flex items-center justify-center gap-2">
          {isLoading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
