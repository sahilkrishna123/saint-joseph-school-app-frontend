import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuth } = useAuth();

    // Still verifying cookie with server — show nothing (or a spinner)
    if (isAuth === null) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <p style={{ color: '#999', fontSize: '14px' }}>Loading…</p>
            </div>
        );
    }

    return isAuth ? children : <Navigate to="/login" replace />;
}