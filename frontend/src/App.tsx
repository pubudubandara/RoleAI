import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ChatPage from './pages/ChatPage';
import VerifySuccessPage from './pages/VerifySuccessPage';
import VerifyErrorPage from './pages/VerifyErrorPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="w-full h-full bg-gray-900 text-gray-100 flex flex-col">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/verify-success" element={<VerifySuccessPage />} />
                <Route path="/verify-error" element={<VerifyErrorPage />} />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
