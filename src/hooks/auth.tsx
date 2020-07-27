import React, { createContext, useCallback, useState, useContext } from 'react';
import api from '../services/api';

interface UserState {
  name: string;
  email: string;
  id: string;
}

interface AuthState {
  token: string;
  user: UserState;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: UserState;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@HomeOffice:token');
    const user = localStorage.getItem('@HomeOffice:user');

    if (token && user) {
      return { token, user: JSON.parse(user) };
    }

    return {} as AuthState;
  });
  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });
    const { token, user } = response.data;
    localStorage.setItem('@HomeOffice:token', `bearer ${token}`);
    localStorage.setItem('@HomeOffice:user', JSON.stringify(user));

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@HomeOffice:token');
    localStorage.removeItem('@HomeOffice:user');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within and AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
