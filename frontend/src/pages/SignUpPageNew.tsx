import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await signup(username, email, password);
      navigate("/chat");
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 dark:bg-gray-900 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={isLoading}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={isLoading}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={isLoading}
          required
        />
        <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white py-2 rounded font-semibold flex items-center justify-center gap-2">
          {isLoading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;