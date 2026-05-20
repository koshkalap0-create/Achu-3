import { PlayCircle, ListMusic, Heart, History, Folder, List } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useSettings } from '../context/SettingsContext';

export default function Sidebar() {
  const { activeTab, setActiveTab } = usePlayer();
  const { appName, appIcon } = useSettings();

  return (
    <aside className="sidebar glass-panel">
      <div className="brand">
        {appIcon ? (
          <img src={appIcon} alt="App Icon" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
        ) : (
          <PlayCircle size={28} />
        )}
        <span>{appName}</span>
      </div>
      
      <nav className="nav-menu">
        <button className={`nav-item ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
          <ListMusic size={20} /> Library
        </button>
        <button className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
          <Heart size={20} /> Favorites
        </button>
        <button className={`nav-item ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>
          <History size={20} /> Recently Played
        </button>
        <button className={`nav-item ${activeTab === 'playlists' ? 'active' : ''}`} onClick={() => setActiveTab('playlists')}>
          <List size={20} /> Playlists
        </button>
        <button className={`nav-item ${activeTab === 'folders' ? 'active' : ''}`} onClick={() => setActiveTab('folders')}>
          <Folder size={20} /> Folders
        </button>
      </nav>
    </aside>
  );
}
