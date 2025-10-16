'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ActiveEmployeeContextType {
  activeEmployeeId: string | null;
  setActiveEmployeeId: (employeeId: string) => void;
  isLoading: boolean;
}

const ActiveEmployeeContext = createContext<ActiveEmployeeContextType | undefined>(undefined);

export function ActiveEmployeeProvider({ children }: { children: React.ReactNode }) {
  const [activeEmployeeId, setActiveEmployeeIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedEmployeeId = sessionStorage.getItem('activeEmployeeId');
      if (storedEmployeeId) {
        setActiveEmployeeIdState(storedEmployeeId);
      } else {
        // Default to a fallback employee if none is set
        const fallbackId = 'EMP001';
        setActiveEmployeeIdState(fallbackId);
        sessionStorage.setItem('activeEmployeeId', fallbackId);
      }
    } catch (error) {
        console.error("Could not access session storage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const setActiveEmployeeId = useCallback((employeeId: string) => {
    try {
      sessionStorage.setItem('activeEmployeeId', employeeId);
      setActiveEmployeeIdState(employeeId);
    } catch (error) {
      console.error("Could not access session storage:", error);
    }
  }, []);

  const value = { activeEmployeeId, setActiveEmployeeId, isLoading };

  return (
    <ActiveEmployeeContext.Provider value={value}>
      {children}
    </ActiveEmployeeContext.Provider>
  );
}

export function useActiveEmployee() {
  const context = useContext(ActiveEmployeeContext);
  if (context === undefined) {
    throw new Error('useActiveEmployee must be used within an ActiveEmployeeProvider');
  }
  return context;
}
