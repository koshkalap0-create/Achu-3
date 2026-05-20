import { useState, useEffect } from 'react';
import { Music, Image as ImageIcon, Settings } from 'lucide-react';
import MusicApp from './MusicApp';
import MediaGallery from './components/MediaGallery';

import SettingsModal from './components/SettingsModal';
import LockScreen from './components/LockScreen';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isLocked } = useAuth();
  const [activeHub, setActiveHub] = useState('music'); // 'music' | 'media' | 'family'
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="global-layout">
      {/* Global Navigation Hub Switcher */}
      <nav className="hub-switcher glass-panel">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
          <button 
            className={`hub-btn ${activeHub === 'music' ? 'active' : ''}`}
            onClick={() => setActiveHub('music')}
            title="Music Player"
          >
            <Music size={24} />
          </button>
          <button 
            className={`hub-btn ${activeHub === 'media' ? 'active' : ''}`}
            onClick={() => setActiveHub('media')}
            title="Media Gallery"
          >
            <ImageIcon size={24} />
          </button>
         
        </div>
        
        <button 
          className="hub-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
          style={{ marginBottom: '16px' }}
        >
          <Settings size={24} />
        </button>
      </nav>

      {/* Main Hub Content */}
      <div className="hub-content">
        {activeHub === 'music' && <MusicApp />}
        {activeHub === 'media' && <MediaGallery />}
        
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
