import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [pin, setPin] = useState(() => localStorage.getItem('appPin') || null);
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem('appPin'));

  const setupPin = (newPin) => {
    localStorage.setItem('appPin', newPin);
    setPin(newPin);
    setIsLocked(false);
  };

  const removePin = () => {
    localStorage.removeItem('appPin');
    setPin(null);
    setIsLocked(false);
  };

  const unlock = (enteredPin) => {
    if (enteredPin === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lock = () => {
    if (pin) setIsLocked(true);
  };

  return (
    <AuthContext.Provider value={{ pin, isLocked, setupPin, removePin, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
};
