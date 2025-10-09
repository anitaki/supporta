import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL;
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [businessName, setBusinessName] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true)

  // -------------------
  // Restore user/session on load
  // -------------------
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedBusiness = localStorage.getItem('businessName');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      if (savedBusiness) setBusinessName(JSON.parse(savedBusiness));
    }

    setLoading(false)
  }, []);

  // -------------------
  // Create axios instance
  // -------------------
  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  // -------------------
  // Refresh token function
  // -------------------
  const refreshToken = useCallback(async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
      const newToken = res.data.accessToken;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (err) {
      console.error('Failed to refresh token', err);
      logout();
      return null;
    }
  }, []);

  // -------------------
  // Request interceptor
  // -------------------
  api.interceptors.request.use(async (config) => {
    if (!token) return config; // skip for login/register

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000;

      // Refresh if less than 1 min remaining
      if (Date.now() > exp - 60000) {
        const newToken = await refreshToken();
        if (newToken) config.headers.Authorization = `Bearer ${newToken}`;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }

    return config;
  });

  // -------------------
  // Login / Logout
  // -------------------
  const login = async (input, password) => {
    const body = input.includes('@') ? { email: input, password } : { username: input, password };

    try {
      // ✅ Use axios directly, not api (avoid interceptor loop)
      const res = await axios.post(`${API_URL}/auth/login`, body, { withCredentials: true });

      const { accessToken, userObj } = res.data;
      setToken(accessToken);
      setUser(userObj);
      setBusinessName(userObj?.businessId?.name || null);

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('businessName', JSON.stringify(userObj?.businessId?.name || null));

      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setBusinessName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('businessName');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        businessName,
        login,
        logout,
        refreshToken,
        api,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
