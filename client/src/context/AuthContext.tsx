import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import { api, setAccessToken, setAuthFailureHandler, apiErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'nexus_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    persistUser(null);
  }, [persistUser]);

  // On load, verify the session against the API (refresh cookie revives an expired access token).
  useEffect(() => {
    let active = true;
    setAuthFailureHandler(() => persistUser(null));

    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (active) persistUser(data.user as User);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
      setAuthFailureHandler(null);
    };
  }, [persistUser, clearSession]);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ twoFactorRequired: boolean; pendingToken?: string }> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.twoFactorRequired) {
        return { twoFactorRequired: true, pendingToken: data.pendingToken as string };
      }
      const loggedIn = data.user as User;
      if (loggedIn.role !== role) {
        throw new Error(`This account is registered as a ${loggedIn.role}, not a ${role}.`);
      }
      setAccessToken(data.accessToken as string);
      persistUser(loggedIn);
      toast.success('Successfully logged in!');
      return { twoFactorRequired: false };
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Login failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verify2fa = async (pendingToken: string, code: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/verify-2fa', { pendingToken, code });
      setAccessToken(data.accessToken as string);
      persistUser(data.user as User);
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Verification failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setAccessToken(data.accessToken as string);
      persistUser(data.user as User);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Registration failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('If an account exists for that email, a reset link has been sent.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not send reset email'));
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/reset-password', { token, password: newPassword });
      toast.success('Password reset successfully. Please log in.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not reset password'));
      throw error;
    }
  };

  const logout = (): void => {
    api.post('/auth/logout').catch(() => undefined); // best-effort server-side revoke
    clearSession();
    toast.success('Logged out successfully');
  };

  // Updates the authenticated user. `userId` kept for signature compatibility;
  // the API always updates the user resolved from the access token.
  const updateProfile = async (_userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const { data } = await api.patch('/users/me', updates);
      persistUser(data.user as User);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not update profile'));
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    verify2fa,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
