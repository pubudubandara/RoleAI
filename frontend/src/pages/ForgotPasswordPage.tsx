import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Reset code sent to your email!");
        // Navigate to verify code page with email
        navigate("/verify-reset-code", { state: { email: email.trim() } });
      } else {
        toast.error(data.error || "Failed to send reset code");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Network error. Please try again.");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Enter your email address and we'll send you a reset code.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          required
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded mb-4"
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;