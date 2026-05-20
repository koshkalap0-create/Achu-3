/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

// Auto-load songs from src/media/songs
const songModules = import.meta.glob('/src/media/songs/*.{mp3,wav,ogg,m4a,flac}', { eager: true, query: '?url', import: 'default' });
const initialSongs = Object.keys(songModules).map((path, index) => {
  const filename = path.split('/').pop();
  const title = filename.replace(/\.[^/.]+$/, "");
  return {
    id: "local-song-" + index,
    title: title,
    artist: "Unknown",
    folder: "Local Library",
    url: songModules[path]
  };
});

export const PlayerProvider = ({ children }) => {
  const [songs, setSongs] = useState(initialSongs.length > 0 ? initialSongs : [
    {
      id: "1",
      title: "First Song Name",
      artist: "Unknown",
      folder: "My Playlist",
      url: "/songs/music1.mp3"
    },
    {
      id: "2",
      title: "Second Song Name",
      artist: "Unknown",
      folder: "My Playlist",
      url: "/songs/music2.mp3"
    }
  ]);

  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [activeFolder, setActiveFolder] = useState(null);
  const [activePlaylist, setActivePlaylist] = useState(null);

  // New States
  const [recentlyPlayed, setRecentlyPlayed] = useState([]); // array of songIds
  const [playlists, setPlaylists] = useState([]); // { id, name, songs: [] }
  const [sleepTimer, setSleepTimer] = useState(null); // Timeout ID
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null); // Time in ms
  const [eqPreset, setEqPreset] = useState('Normal');

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const filtersRef = useRef([]);

  // Setup Web Audio API
  const initAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

      // Create 3-band EQ (Low, Mid, High)
      const lowFilter = audioContextRef.current.createBiquadFilter();
      lowFilter.type = 'lowshelf';
      lowFilter.frequency.value = 320;

      const midFilter = audioContextRef.current.createBiquadFilter();
      midFilter.type = 'peaking';
      midFilter.frequency.value = 1000;
      midFilter.Q.value = 0.5;

      const highFilter = audioContextRef.current.createBiquadFilter();
      highFilter.type = 'highshelf';
      highFilter.frequency.value = 3200;

      // Connect: source -> low -> mid -> high -> destination
      sourceNodeRef.current.connect(lowFilter);
      lowFilter.connect(midFilter);
      midFilter.connect(highFilter);
      highFilter.connect(audioContextRef.current.destination);

      filtersRef.current = [lowFilter, midFilter, highFilter];
      applyEqPreset(eqPreset);
    }
  };

  const applyEqPreset = (preset) => {
    setEqPreset(preset);
    if (!filtersRef.current.length) return;

    const [low, mid, high] = filtersRef.current;

    switch (preset) {
      case 'Bass Boost':
        low.gain.value = 15; mid.gain.value = 0; high.gain.value = 0; break;
      case 'Pop':
        low.gain.value = -2; mid.gain.value = 5; high.gain.value = 2; break;
      case 'Rock':
        low.gain.value = 8; mid.gain.value = -4; high.gain.value = 6; break;
      case 'Classical':
        low.gain.value = 0; mid.gain.value = 0; high.gain.value = 5; break;
      case 'Normal':
      default:
        low.gain.value = 0; mid.gain.value = 0; high.gain.value = 0; break;
    }
  };

  useEffect(() => {
    applyEqPreset(eqPreset);
  }, [eqPreset]);

  // Handle sleep timer countdown
  useEffect(() => {
    let interval;
    if (sleepTimerRemaining !== null && sleepTimerRemaining > 0) {
      interval = setInterval(() => {
        setSleepTimerRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            if (audioRef.current) audioRef.current.pause();
            setIsPlaying(false);
            return null;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  const setTimer = (minutes) => {
    if (sleepTimer) clearTimeout(sleepTimer);
    if (minutes === 0) {
      setSleepTimer(null);
      setSleepTimerRemaining(null);
      return;
    }
    const ms = minutes * 60 * 1000;
    setSleepTimerRemaining(ms);
  };

  const addToRecentlyPlayed = (songId) => {
    setRecentlyPlayed(prev => {
      const updated = [songId, ...prev.filter(id => id !== songId)].slice(0, 20);
      return updated;
    });
  };

  // Sync audio element with current song
  useEffect(() => {
    if (currentSongIndex >= 0 && songs[currentSongIndex]) {
      const song = songs[currentSongIndex];
      if (audioRef.current) {
        // Parse urls to ensure robust comparison
        const newUrl = new URL(song.url, window.location.origin).href;
        if (audioRef.current.src !== newUrl) {
          audioRef.current.src = song.url;
        }
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
        
        // Lock Screen Music Metadata
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: song.title || 'Unknown Title',
            artist: song.artist || 'Unknown Artist',
            album: song.folder || 'Aura Hub'
          });
        }
      }
    }
  }, [currentSongIndex, songs, isPlaying]);

  const toggleFavorite = (songId, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const newFav = new Set(prev);
      if (newFav.has(songId)) newFav.delete(songId);
      else newFav.add(songId);
      return newFav;
    });
  };

  const playSong = (index) => {
    initAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setCurrentSongIndex(index);
    setIsPlaying(true);
    addToRecentlyPlayed(songs[index].id);
  };

  const togglePlay = () => {
    initAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (currentSongIndex === -1 && songs.length > 0) {
      playSong(0);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else if (currentSongIndex !== -1) {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (songs.length === 0) return;
    let nextIdx;
    if (isShuffle) {
      do {
        nextIdx = Math.floor(Math.random() * songs.length);
      } while (nextIdx === currentSongIndex && songs.length > 1);
    } else {
      nextIdx = (currentSongIndex + 1) % songs.length;
    }
    playSong(nextIdx);
  };

  const playPrev = () => {
    if (songs.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIdx = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(prevIdx);
  };

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  });

  const createPlaylist = (name) => {
    setPlaylists(prev => [...prev, { id: crypto.randomUUID(), name, songs: [] }]);
  };

  const addToPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId && !pl.songs.includes(songId)) {
        return { ...pl, songs: [...pl.songs, songId] };
      }
      return pl;
    }));
  };

  // Derive folders from songs
  const folders = Array.from(new Set(songs.map(s => s.folder).filter(Boolean)));

  const value = {
    songs, setSongs,
    currentSongIndex,
    currentSong: songs[currentSongIndex],
    isPlaying, setIsPlaying,
    progress, setProgress,
    duration, setDuration,
    favorites, toggleFavorite,
    isShuffle, setIsShuffle,
    isRepeat, setIsRepeat,
    activeTab, setActiveTab,
    activeFolder, setActiveFolder,
    activePlaylist, setActivePlaylist,
    recentlyPlayed,
    playlists, createPlaylist, addToPlaylist,
    folders,
    sleepTimerRemaining, setTimer,
    eqPreset, setEqPreset, applyEqPreset,
    audioRef,
    playSong, togglePlay, playNext, playPrev,
    initAudioContext,
    removeSong: (songId) => {
      setSongs(prev => prev.filter(s => s.id !== songId));
      if (songs[currentSongIndex]?.id === songId) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    },
    renameSong: (songId, newTitle) => {
      setSongs(prev => prev.map(s => s.id === songId ? { ...s, title: newTitle } : s));
    }
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
