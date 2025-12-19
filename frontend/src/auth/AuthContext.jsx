// 페이지 접근 시 로그인 여부 판단

import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'

axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    const refreshAuth = async () => {
        setChecking(true);
        try{
             const res = await axios.get("http://localhost:3000/api/auth/me");
             setIsLoggedIn(!!res.data?.isLoggedIn);
             setUser(res.data?.user ?? null);
        } catch (e) {
            setIsLoggedIn(false);
            setUser(null);
        } finally {
            setChecking(false);
        }
    };

    useEffect(()=>{
        refreshAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, checking, refreshAuth }}>
            { children }
        </AuthContext.Provider>
    )
}
export function useAuth() {
    return useContext(AuthContext);
}
