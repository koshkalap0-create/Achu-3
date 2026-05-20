import { useState } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Heart, Music, Speaker, Clock, Sliders 
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function PlayerBar() {
  const { 
    currentSong, isPlaying, progress, duration, setProgress, 
    isShuffle, setIsShuffle, isRepeat, setIsRepeat, 
    togglePlay, playNext, playPrev, favorites, toggleFavorite,
    sleepTimerRemaining, setTimer, eqPreset, setEqPreset,
    audioRef
  } = usePlayer();

  const [showEq, setShowEq] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  return (
    <div className="player-bar glass-panel">
      <div className="player-song-info">
        {currentSong && (
          <>
            <div className={`player-cover ${isPlaying ? 'playing' : ''}`}>
              <Music size={24} />
            </div>
            <div>
              <div className="player-title">{currentSong.title}</div>
              <div className="player-artist">{currentSong.artist}</div>
            </div>
            <button className={`fav-btn ${favorites.has(currentSong.id) ? 'active' : ''}`} onClick={(e) => toggleFavorite(currentSong.id, e)}>
              <Heart size={18} fill={favorites.has(currentSong.id) ? "currentColor" : "none"} />
            </button>
          </>
        )}
      </div>

      <div className="player-controls-wrapper">
        <div className="player-controls">
          <button className={`control-btn ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
            <Shuffle size={18} />
          </button>
          <button className="control-btn" onClick={playPrev}>
            <SkipBack size={24} />
          </button>
          <button className="play-pause-btn" onClick={togglePlay}>
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button className="control-btn" onClick={playNext}>
            <SkipForward size={24} />
          </button>
          <button className={`control-btn ${isRepeat ? 'active' : ''}`} onClick={() => setIsRepeat(!isRepeat)}>
            <Repeat size={18} />
          </button>
        </div>

        <div className="progress-container">
          <span>{formatTime(progress)}</span>
          <div className="progress-bar-wrapper" style={{ '--progress': `${duration ? (progress / duration) * 100 : 0}%` }}>
            <div className="progress-bar-fill"></div>
            <input type="range" min={0} max={duration || 100} value={progress} onChange={handleSeek} />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-extra">
        <div className="relative-container">
          <button className={`control-btn ${sleepTimerRemaining ? 'active' : ''}`} onClick={() => setShowTimer(!showTimer)}>
            <Clock size={18} />
            {sleepTimerRemaining && <span className="timer-badge">{Math.ceil(sleepTimerRemaining / 60000)}m</span>}
          </button>
          {showTimer && (
            <div className="popover-menu bottom-up">
              <div className="popover-header">Sleep Timer</div>
              {[0, 15, 30, 45, 60].map(min => (
                <button key={min} className="popover-item" onClick={() => { setTimer(min); setShowTimer(false); }}>
                  {min === 0 ? 'Off' : `${min} Minutes`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative-container">
          <button className={`control-btn ${eqPreset !== 'Normal' ? 'active' : ''}`} onClick={() => setShowEq(!showEq)}>
            <Sliders size={18} />
          </button>
          {showEq && (
            <div className="popover-menu bottom-up">
              <div className="popover-header">Equalizer</div>
              {['Normal', 'Bass Boost', 'Pop', 'Rock', 'Classical'].map(preset => (
                <button key={preset} className={`popover-item ${eqPreset === preset ? 'active' : ''}`} onClick={() => { setEqPreset(preset); setShowEq(false); }}>
                  {preset}
                </button>
              ))}
            </div>
          )}
        </div>

        <Speaker size={18} style={{ color: 'var(--text-secondary)' }} />
        <input 
          type="range" min={0} max={1} step={0.01} defaultValue={1} className="volume-slider"
          onChange={(e) => { if (audioRef.current) audioRef.current.volume = e.target.value; }}
        />
      </div>
    </div>
  );
}
