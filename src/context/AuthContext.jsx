import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // null = still checking, true = logged in, false = logged out
    const [isAuth, setIsAuth] = useState(null);

    // On every page load/refresh, ask the server if the cookie is still valid
    useEffect(() => {
        api.get("/users/me", { withCredentials: true })
            .then(() => setIsAuth(true))
            .catch(() => setIsAuth(false));
    }, []);

    const login = () => setIsAuth(true);

    const logout = async () => {
        try {
            await api.post("/users/logout", {}, { withCredentials: true });
        } catch {
            // fail silently — still clear client state
        } finally {
            setIsAuth(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}