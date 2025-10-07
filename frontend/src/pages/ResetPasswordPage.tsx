import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email and reset code from navigation state
  const email = location.state?.email || "";
  const resetCode = location.state?.resetCode || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!email || !resetCode) {
      toast.error("Session expired. Please try again.");
      navigate("/forgot-password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          resetCode: resetCode,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully!");
        // Navigate to login page
        navigate("/login");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Password reset error:", error);
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
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Enter your new password
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          required
          disabled={isLoading}
          minLength={6}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          required
          disabled={isLoading}
          minLength={6}
        />

        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded mb-4"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage;