import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivacyMode: false,
  togglePrivacyMode: () => {},
});

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('privacy_mode') === 'true';
    }
    return false;
  });

  const togglePrivacyMode = () => {
    setIsPrivacyMode(prev => {
      const newValue = !prev;
      localStorage.setItem('privacy_mode', String(newValue));
      return newValue;
    });
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);