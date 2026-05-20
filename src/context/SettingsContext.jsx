/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('themeColor') || 'indigo');
  const [customBgColor, setCustomBgColor] = useState(() => localStorage.getItem('customBgColor') || '');
  const [appName, setAppName] = useState(() => localStorage.getItem('appName') || 'Aura Hub');
  const [appIcon, setAppIcon] = useState(() => localStorage.getItem('appIcon') || null);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('customBgColor', customBgColor);
    localStorage.setItem('appName', appName);
    if (appIcon) localStorage.setItem('appIcon', appIcon);
    
    // Update body attributes for CSS
    document.body.setAttribute('data-theme', themeMode);
    
    if (themeColor.startsWith('#')) {
      document.body.setAttribute('data-color', 'custom');
      document.documentElement.style.setProperty('--accent-color', themeColor);
      document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${themeColor}, ${themeColor}aa, ${themeColor}55)`);
    } else {
      document.body.setAttribute('data-color', themeColor);
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--accent-gradient');
    }

    if (customBgColor) {
      document.documentElement.style.setProperty('--bg-color', customBgColor);
    } else {
      document.documentElement.style.removeProperty('--bg-color');
    }
  }, [themeMode, themeColor, customBgColor, appName, appIcon]);

  const value = {
    themeMode, setThemeMode,
    themeColor, setThemeColor,
    customBgColor, setCustomBgColor,
    appName, setAppName,
    appIcon, setAppIcon
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
