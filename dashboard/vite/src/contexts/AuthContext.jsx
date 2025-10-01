import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [businessName, setBusinessName] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    console.log('auth user updated:', user);
  }, [user]);

  const login = async (input, password) => {
    const body = input.includes('@') ? { email: input, password } : { username: input, password };

    try {
      const res = await axios.post(`${API_URL}/auth/login`, body, { withCredentials: true });
      if (!res) throw new Error('Login failed');

      setToken(res.data.accessToken);
      localStorage.setItem('token', res.data.accessToken);
      setUser(res.data.userObj);
      setBusinessName(res.data?.userObj?.businessId?.name)

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setBusinessName(null)
    localStorage.removeItem('token');
  };

  return <AuthContext.Provider value={{ user, token, businessName, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
