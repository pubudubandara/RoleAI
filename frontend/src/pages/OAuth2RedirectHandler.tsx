import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthFromToken } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current) {
            return;
        }
        
        const token = searchParams.get("token");
        console.log("OAuth2 Redirect - Token received:", token ? "Yes" : "No");
        
        if (token) {
            hasProcessed.current = true;
            
            try {
                // Decode JWT to get user info (simple base64 decode, no verification)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const payload = JSON.parse(jsonPayload);
                const email = payload.sub; // Email is in the 'sub' claim
                const userId = payload.userId; // User ID from custom claim
                const fullName = payload.fullName; // Full name from custom claim
                
                console.log("OAuth2 Redirect - Decoded payload:", { email, userId, fullName });
                
                // Create user object with data from JWT
                const user = {
                    id: userId || 0,
                    email: email,
                    fullName: fullName || email
                };
                
                // Use AuthContext to set auth state - this updates both localStorage AND context state
                setAuthFromToken(token, user);
                
                console.log("OAuth2 Redirect - Auth state updated, redirecting to /chat");
                
                // Small delay to ensure state is set before navigation
                setTimeout(() => {
                    navigate("/chat", { replace: true });
                }, 100);
            } catch (error) {
                console.error("Error processing OAuth2 token:", error);
                hasProcessed.current = false;
                navigate("/login", { replace: true });
            }
        } else {
            // No token found, redirect to login
            console.log("OAuth2 Redirect - No token, redirecting to /login");
            hasProcessed.current = true;
            navigate("/login", { replace: true });
        }
    }, [searchParams, navigate, setAuthFromToken]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing login...</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
