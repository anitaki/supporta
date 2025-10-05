import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [businessName, setBusinessName] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    console.log('auth user updated:', user);
  }, [user]);

  // -------------------
  // Login / Logout
  // -------------------
  const login = async (input, password) => {
    const body = input.includes('@') ? { email: input, password } : { username: input, password };

    try {
      const res = await api.post(`${API_URL}/auth/login`, body, { withCredentials: true });
      if (!res) throw new Error('Login failed');

      setToken(res.data.accessToken);
      localStorage.setItem('token', res.data.accessToken);
      setUser(res.data.userObj)
      setBusinessName(res.data?.userObj?.businessId?.name);

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setBusinessName(null);
    localStorage.removeItem('token');
  };

  // -------------------
  // Refresh Token
  // -------------------
  const refreshToken = async () => {
    try {
      const res = await api.post(`${API_URL}/auth/refresh-token`);
      setToken(res.data.accessToken);
      localStorage.setItem('token', res.data.accessToken);
      return res.data.accessToken;
    } catch (err) {
      console.error('Failed to refresh token', err);
      logout();
      return null;
    }
  };

  // -------------------
  // Axios instance with interceptor
  // -------------------

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
  });

  // if axios call has no token (ie login, register) don't modify 
  api.interceptors.request.use(async (config) => {
    if (!token) return config;

    const exp = jwtDecode(token).exp * 1000; //ms
    if (Date.now > exp - 60000) {
      // refresh if <1 min left
      const newToken = await refreshToken();
      if (!newToken) throw new axios.Cancel('No valid token');
    }

    // add token to req headers
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return <AuthContext.Provider value={{ user, token, businessName, login, logout, refreshToken, api }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
