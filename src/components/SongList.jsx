import { useState } from 'react';
import { Play, Music, Heart, Plus, Edit2, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongList({ songs, listName }) {
  const { currentSong, playSong, favorites, toggleFavorite, playlists, addToPlaylist, removeSong, renameSong } = usePlayer();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);

  const handleRename = (song) => {
    const newName = window.prompt("Rename song:", song.title);
    if (newName && newName.trim()) {
      renameSong(song.id, newName.trim());
    }
  };

  if (!songs || songs.length === 0) {
    return (
      <div className="empty-state">
        <Music className="empty-icon" />
        <h2 className="empty-title">Empty {listName}</h2>
        <p>No songs found here.</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      {songs.map((song, i) => {
        const isSongPlaying = currentSong?.id === song.id;

        return (
          <div key={song.id} className={`song-item ${isSongPlaying ? 'playing' : ''}`} onClick={() => playSong(song.originalIndex)}>
            <div className="song-index">
              {isSongPlaying ? (
                <span className="song-play-icon" style={{color: 'var(--accent-color)'}}><Music size={16} /></span>
              ) : (
                <span className="song-index-num">{i + 1}</span>
              )}
              {!isSongPlaying && <Play size={16} className="song-play-icon" />}
            </div>
            
            <div className="song-info">
              <span className="song-title">{song.title}</span>
              <span className="song-artist">{song.artist} {song.folder && ` • ${song.folder}`}</span>
            </div>

            <div className="song-actions" onClick={e => e.stopPropagation()}>
              <button className="icon-btn" onClick={() => handleRename(song)} title="Rename">
                <Edit2 size={16} />
              </button>
              
              <div className="relative-container">
                <button className="icon-btn" onClick={() => setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id)}>
                  <Plus size={18} />
                </button>
                {showPlaylistMenu === song.id && (
                  <div className="popover-menu" style={{ right: 0 }}>
                    {playlists.length === 0 ? <div className="popover-item text-secondary" style={{cursor:'default'}}>No playlists</div> : null}
                    {playlists.map(pl => (
                      <button key={pl.id} className="popover-item" onClick={() => { addToPlaylist(pl.id, song.id); setShowPlaylistMenu(null); }}>
                        {pl.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                className={`fav-btn ${favorites.has(song.id) ? 'active' : ''}`}
                onClick={(e) => toggleFavorite(song.id, e)}
              >
                <Heart size={18} fill={favorites.has(song.id) ? "currentColor" : "none"} />
              </button>

              <button className="icon-btn" style={{color: 'var(--danger)'}} onClick={() => removeSong(song.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  );
}
