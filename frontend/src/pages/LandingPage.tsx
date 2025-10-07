import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-6">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-white mb-6">
          🤖 RoleAI
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Experience intelligent conversations with AI characters. Choose your role, select your model, and start chatting!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/signup"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
