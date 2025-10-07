import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 rounded-b-2xl shadow">
      <Link to="/" className="text-xl font-semibold">🤖 RoleAI</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="hidden sm:inline">{user.fullName}</span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
