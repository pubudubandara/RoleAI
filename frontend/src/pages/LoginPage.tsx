import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as chatSessionApi from '../api/chatSessionApi';
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700"
        />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          Login
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
