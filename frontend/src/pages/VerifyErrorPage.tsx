import { Link } from "react-router-dom";

const VerifyErrorPage = () => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-900 p-6">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
          <p className="text-gray-300 mb-6">
            The verification link is invalid or has expired. Please try signing up again or request a new verification email.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            to="/signup"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Sign Up Again
          </Link>
          
          <Link
            to="/login"
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors inline-block"
          >
            Try Login
          </Link>
        </div>
        
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

export default VerifyErrorPage;