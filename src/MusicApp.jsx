import { useState } from 'react';
import { Upload, Plus, Folder, Search } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import SongList from './components/SongList';
import { usePlayer } from './context/PlayerContext';

export default function MusicApp() {
  const { 
    songs, setSongs, activeTab, recentlyPlayed, playlists, createPlaylist,
    folders, activeFolder, setActiveFolder, activePlaylist, setActivePlaylist,
    favorites, initAudioContext, audioRef, setProgress, setDuration, isRepeat, playNext
  } = usePlayer();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = (e) => {
    initAudioContext();
    
    const files = Array.from(e.target.files);
    const newSongs = files.map((file) => {
      let folderName = 'Unknown Album';
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 1) {
          folderName = parts[0]; 
        }
      }

      return {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        folder: folderName,
        url: URL.createObjectURL(file),
        file: file
      };
    });
    
    setSongs(prev => [...prev, ...newSongs]);
  };

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };

  const songsWithOriginalIndex = songs.map((s, i) => ({ ...s, originalIndex: i }));

  let displayedSongs = [];
  let headerTitle = "Your Library";

  if (activeTab === 'library') {
    displayedSongs = songsWithOriginalIndex;
  } else if (activeTab === 'favorites') {
    displayedSongs = songsWithOriginalIndex.filter(s => favorites.has(s.id));
    headerTitle = "Liked Songs";
  } else if (activeTab === 'recent') {
    displayedSongs = recentlyPlayed.map(id => songsWithOriginalIndex.find(s => s.id === id)).filter(Boolean);
    headerTitle = "Recently Played";
  } else if (activeTab === 'playlists' && activePlaylist) {
    const pl = playlists.find(p => p.id === activePlaylist);
    if (pl) {
      displayedSongs = pl.songs.map(id => songsWithOriginalIndex.find(s => s.id === id)).filter(Boolean);
      headerTitle = `Playlist: ${pl.name}`;
    }
  } else if (activeTab === 'folders' && activeFolder) {
    displayedSongs = songsWithOriginalIndex.filter(s => s.folder === activeFolder);
    headerTitle = `Folder: ${activeFolder}`;
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    displayedSongs = displayedSongs.filter(song => 
      song.title.toLowerCase().includes(query) || 
      (song.artist && song.artist.toLowerCase().includes(query)) ||
      (song.folder && song.folder.toLowerCase().includes(query))
    );
  }

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };

  return (
    <>
      <div className="app-container">
        <Sidebar />

        <main className="main-content">
          <header className="header">
            <h1 className="page-title">{headerTitle}</h1>
            
            <div className="search-container" style={{ display: 'flex', alignItems: 'center', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '20px', padding: '0 12px', flex: 1, maxWidth: '400px', margin: '0 20px' }}>
              <Search size={18} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search songs, artists, folders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '10px', width: '100%', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <label className="upload-btn">
                <Upload size={18} />
                Upload Songs
                <input 
                  type="file" 
                  accept="audio/*" 
                  multiple 
                  onChange={handleFileUpload} 
                  className="hidden-input"
                />
              </label>
              <label className="upload-btn" style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}>
                <Folder size={18} />
                Upload Folder
                <input 
                  type="file" 
                  accept="audio/*" 
                  multiple 
                  webkitdirectory="true"
                  directory="true"
                  onChange={handleFileUpload} 
                  className="hidden-input"
                />
              </label>
            </div>
          </header>

          {activeTab === 'playlists' && !activePlaylist && (
            <div className="grid-view">
              <form onSubmit={handleCreatePlaylist} className="create-card">
                <input 
                  type="text" 
                  placeholder="New Playlist Name..." 
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  className="text-input"
                />
                <button type="submit" className="upload-btn" style={{marginTop: '12px', width: '100%', justifyContent: 'center'}}>
                  <Plus size={16}/> Create
                </button>
              </form>
              {playlists.map(pl => (
                <div key={pl.id} className="folder-card" onClick={() => setActivePlaylist(pl.id)}>
                  <h3>{pl.name}</h3>
                  <p>{pl.songs.length} songs</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'folders' && !activeFolder && (
            <div className="grid-view">
              {folders.map(folder => (
                <div key={folder} className="folder-card" onClick={() => setActiveFolder(folder)}>
                  <h3>{folder}</h3>
                </div>
              ))}
              {folders.length === 0 && <p className="text-secondary">No folders uploaded yet.</p>}
            </div>
          )}

          {((activeTab !== 'playlists' && activeTab !== 'folders') || activePlaylist || activeFolder) && (
            <>
              {(activePlaylist || activeFolder) && (
                <button 
                  className="back-btn"
                  onClick={() => activePlaylist ? setActivePlaylist(null) : setActiveFolder(null)}
                >
                  ← Back
                </button>
              )}
              <SongList songs={displayedSongs} listName={headerTitle} />
            </>
          )}
        </main>
      </div>

      <PlayerBar />

      <audio 
        ref={audioRef} 
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={onTimeUpdate}
        crossOrigin="anonymous"
      />
    </>
  );
}
