import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Edit2, Trash2 } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export default function Lightbox({ initialIndex, onClose, displayedMedia }) {
  const { renameMedia, removeMedia } = useMedia();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [isFading, setIsFading] = useState(false);
  
  const videoRef = useRef(null);
  
  const mediaCount = displayedMedia.length;
  const currentItem = displayedMedia[currentIndex];

  const goNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaCount);
      setIsFading(false);
    }, 200); // match css transition duration
  };

  const goPrev = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + mediaCount) % mediaCount);
      setIsFading(false);
    }, 200);
  };

  const handleRename = () => {
    if (!currentItem) return;
    const newName = window.prompt("Rename file:", currentItem.name);
    if (newName && newName.trim()) {
      renameMedia(currentItem.id, newName.trim());
    }
  };

  const handleDelete = () => {
    if (!currentItem) return;
    if (window.confirm("Are you sure you want to delete this file?")) {
      removeMedia(currentItem.id);
      if (mediaCount <= 1) {
        onClose();
      } else {
        // Go to next item, but since the array will shrink, we just ensure index bounds
        setCurrentIndex(prev => (prev === mediaCount - 1 ? prev - 1 : prev));
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isPlayingSlideshow) {
      interval = setInterval(() => {
        // Only auto advance if it's an image, or if it's a video we might want to wait for it to end.
        // For simplicity, we just trigger next every 4 seconds for images.
        if (currentItem?.type === 'video' && videoRef.current) {
          // don't interrupt video
        } else {
          goNext();
        }
      }, 4000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayingSlideshow, currentIndex, currentItem]);

  // Handle keyboard nav
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentItem) return null;

  return (
    <div className="lightbox-overlay">
      <div className="lightbox-toolbar">
        <div className="lightbox-counter">
          {currentIndex + 1} / {mediaCount}
        </div>
        <div className="lightbox-actions">
          <button className="icon-btn" onClick={handleRename} title="Rename">
            <Edit2 size={24} />
          </button>
          <button className="icon-btn" style={{color: 'var(--danger)'}} onClick={handleDelete} title="Delete">
            <Trash2 size={24} />
          </button>
          <button className="icon-btn" onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)} title="Slideshow">
            {isPlayingSlideshow ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={28} />
          </button>
        </div>
      </div>

      <button className="lightbox-nav-btn prev" onClick={(e) => { e.stopPropagation(); goPrev(); }}>
        <ChevronLeft size={48} />
      </button>

      <div className={`lightbox-content ${isFading ? 'fading' : ''}`}>
        {currentItem.type === 'image' ? (
          <img src={currentItem.url} alt={currentItem.name} className="lightbox-media" />
        ) : (
          <video 
            ref={videoRef}
            src={currentItem.url} 
            controls 
            autoPlay 
            className="lightbox-media" 
            onEnded={() => isPlayingSlideshow && goNext()}
          />
        )}
        <div className="lightbox-caption">{currentItem.name}</div>
      </div>

      <button className="lightbox-nav-btn next" onClick={(e) => { e.stopPropagation(); goNext(); }}>
        <ChevronRight size={48} />
      </button>
    </div>
  );
}
