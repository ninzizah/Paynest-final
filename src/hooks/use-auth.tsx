'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_USERS, type Employee } from '@/lib/data';

type LoggedInUser = {
    role: 'admin' | 'hr' | 'employee';
    id?: string;
}

interface AuthContextType {
  loggedInUser: LoggedInUser | null;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<LoggedInUser | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('loggedInUser');
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Could not access session storage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email?: string, password?: string): Promise<LoggedInUser | null> => {
    let user: LoggedInUser | null = null;
    
    if (email === MOCK_USERS.admin.email && password === MOCK_USERS.admin.password) {
        user = { role: 'admin' };
    } 
    else if (email === MOCK_USERS.hr.email && password === MOCK_USERS.hr.password) {
        user = { role: 'hr' };
    }
    else {
        try {
            const res = await fetch('/api/employees');
            if (!res.ok) {
              throw new Error('Failed to fetch employees');
            }
            const employees: Employee[] = await res.json();
            const employee = employees.find(e => e.email === email && e.password === password);
            if (employee) {
                user = { role: 'employee', id: employee.id };
            }
        } catch (error) {
            console.error("Failed to login as employee:", error);
            return null;
        }
    }

    if (user) {
        try {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            setLoggedInUser(user);
        } catch (error) {
            console.error("Could not access session storage:", error);
            setLoggedInUser(user);
        }
    }
    return user;
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('activeEmployeeId');
    } catch (error) {
      console.error("Could not access session storage:", error);
    }
    setLoggedInUser(null);
  }, []);

  const value = { loggedInUser, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
