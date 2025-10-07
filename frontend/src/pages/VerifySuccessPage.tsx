import { Link } from "react-router-dom";

const VerifySuccessPage = () => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-900 p-6">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4">Email Verified Successfully!</h2>
          <p className="text-gray-300 mb-6">
            Your email has been verified. You can now log in to your account.
          </p>
        </div>
        
        <Link
          to="/login"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors inline-block"
        >
          Go to Login
        </Link>
        
        <div className="mt-4">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifySuccessPage;