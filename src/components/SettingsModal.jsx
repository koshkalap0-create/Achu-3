import { useState, useRef } from 'react';
import { X, Upload, Download, Lock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsModal({ onClose }) {
  const { themeMode, setThemeMode, themeColor, setThemeColor, customBgColor, setCustomBgColor, appName, setAppName, appIcon, setAppIcon } = useSettings();
  const { pin, setupPin, removePin } = useAuth();
  
  const [newPin, setNewPin] = useState('');
  
  const handleExportData = () => {
    const data = {
      themeMode: localStorage.getItem('themeMode'),
      themeColor: localStorage.getItem('themeColor'),
      customBgColor: localStorage.getItem('customBgColor'),
      appName: localStorage.getItem('appName'),
      appIcon: localStorage.getItem('appIcon')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aurahub_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.themeMode) setThemeMode(data.themeMode);
        if (data.themeColor) setThemeColor(data.themeColor);
        if (data.customBgColor) setCustomBgColor(data.customBgColor);
        if (data.appName) setAppName(data.appName);
        if (data.appIcon) setAppIcon(data.appIcon);
        alert('Settings restored successfully!');
      } catch {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };
  const fileInputRef = useRef(null);

  const handleIconUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAppIcon(URL.createObjectURL(e.target.files[0]));
    }
  };

  const colors = [
    { name: 'Indigo', value: 'indigo', hex: '#6366f1' },
    { name: 'Emerald', value: 'emerald', hex: '#10b981' },
    { name: 'Rose', value: 'rose', hex: '#f43f5e' },
    { name: 'Amber', value: 'amber', hex: '#f59e0b' },
    { name: 'Purple', value: 'purple', hex: '#a855f7' }
  ];

  return (
    <div className="lightbox-overlay" style={{ alignItems: 'center' }}>
      <div className="modal-content glass-panel">
        <div className="header" style={{ marginBottom: '20px' }}>
          <h2>App Settings</h2>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="form-group row">
            <label>Theme Mode</label>
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${themeMode === 'dark' ? 'active' : ''}`}
                onClick={() => setThemeMode('dark')}
              >Dark</button>
              <button 
                className={`toggle-btn ${themeMode === 'light' ? 'active' : ''}`}
                onClick={() => setThemeMode('light')}
              >Light</button>
            </div>
          </div>

          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-picker" style={{ marginBottom: '12px' }}>
              {colors.map(color => (
                <button
                  key={color.value}
                  className={`color-swatch ${themeColor === color.value ? 'active' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setThemeColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={themeColor.startsWith('#') ? themeColor : '#6366f1'} 
                onChange={(e) => setThemeColor(e.target.value)} 
                style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', background: 'transparent' }} 
              />
              <span className="text-secondary" style={{ fontSize: '13px' }}>Custom Accent (Hex)</span>
            </div>
          </div>

          <div className="form-group">
            <label>Custom Background Color</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={customBgColor || (themeMode === 'dark' ? '#0f0f13' : '#f3f4f6')} 
                onChange={(e) => setCustomBgColor(e.target.value)} 
                style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', background: 'transparent' }} 
              />
              <button className="text-input" style={{ width: 'auto' }} onClick={() => setCustomBgColor('')}>Reset</button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Branding</h3>
          <div className="form-group">
            <label>App Name</label>
            <input 
              type="text" 
              className="text-input" 
              value={appName} 
              onChange={e => setAppName(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label>App Icon</label>
            <div className="icon-upload-preview">
              {appIcon ? (
                <img src={appIcon} alt="App Icon" className="custom-icon-preview" />
              ) : (
                <div className="custom-icon-placeholder">Icon</div>
              )}
              <button className="text-input" style={{width: 'auto', display: 'flex', gap: '8px'}} onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} /> Upload Custom Icon
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden-input" onChange={handleIconUpload} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security & Backup</h3>
          
          <div className="form-group">
            <label>App Lock (PIN)</label>
            {pin ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} /> PIN is Active
                </span>
                <button className="upload-btn" style={{ background: 'var(--danger)', width: 'auto' }} onClick={removePin}>Remove PIN</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="Enter 4-digit PIN" 
                  className="text-input"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <button 
                  className="upload-btn" 
                  onClick={() => {
                    if (newPin.length === 4) {
                      setupPin(newPin);
                      setNewPin('');
                    } else {
                      alert('PIN must be 4 digits');
                    }
                  }}
                  style={{ width: 'auto' }}
                >
                  Set PIN
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Backup & Restore</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="upload-btn" style={{ width: 'auto' }} onClick={handleExportData}>
                <Download size={16} /> Export Settings
              </button>
              <label className="upload-btn" style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', width: 'auto' }}>
                <Upload size={16} /> Import Settings
                <input type="file" accept=".json" className="hidden-input" onChange={handleImportData} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
