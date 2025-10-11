import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";

const VerifyResetCodePage = () => {
  const [resetCode, setResetCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state
  const email = location.state?.email || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      toast.error("Please enter the reset code");
      return;
    }

    if (!email) {
      toast.error("Email not found. Please try again.");
      navigate("/forgot-password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          resetCode: resetCode.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Code verified successfully!");
        // Navigate to reset password page with email and code
        navigate("/reset-password", {
          state: {
            email: email,
            resetCode: resetCode.trim()
          }
        });
      } else {
        toast.error(data.error || "Invalid reset code");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email not found. Please try again.");
      navigate("/forgot-password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("New reset code sent to your email!");
      } else {
        toast.error(data.error || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend code error:", error);
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
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Reset Code</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Enter the 6-digit code sent to {email}
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white text-center text-lg font-mono"
          maxLength={6}
          required
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || resetCode.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded mb-4"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 text-sm disabled:text-gray-500"
          >
            Didn't receive code? Resend
          </button>
          <br />
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
            Use different email
          </Link>
        </div>
      </form>
    </div>
  );
};

export default VerifyResetCodePage;