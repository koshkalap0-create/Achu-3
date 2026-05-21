import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function StoryViewer({ mediaList, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  const currentMedia = mediaList[currentIndex];
  const STORY_DURATION = 5000; // 5 seconds per image

  const handleNext = () => {
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const resetFrame = requestAnimationFrame(() => setProgress(0));
    let animationFrame;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      
      if (!isPaused) {
        if (currentMedia.type === 'image') {
          const elapsed = timestamp - startTime;
          const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
          setProgress(newProgress);
          
          if (newProgress >= 100) {
            handleNext();
            return;
          }
        }
      } else {
        // Shift start time so progress doesn't jump when unpaused
        startTime = timestamp - (progress / 100) * STORY_DURATION;
      }
      
      animationFrame = requestAnimationFrame(animate);
    };

    if (currentMedia.type === 'image') {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // For videos, progress is driven by timeupdate event
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.log('Video auto-play blocked', e));
      }
    }

    return () => {
      cancelAnimationFrame(resetFrame);
      cancelAnimationFrame(animationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPaused, currentMedia.type]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isPaused) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  return (
    <div className="lightbox-overlay" style={{ zIndex: 9999 }}>
      {/* Top Progress Bars */}
      <div style={{ position: 'absolute', top: 20, left: 16, right: 16, display: 'flex', gap: '4px', zIndex: 10 }}>
        {mediaList.map((_, idx) => (
          <div key={idx} style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: '#fff',
              width: idx === currentIndex ? `${progress}%` : (idx < currentIndex ? '100%' : '0%'),
              transition: idx === currentIndex && progress === 0 ? 'none' : 'width 0.1s linear'
            }} />
          </div>
        ))}
      </div>

      {/* Header controls */}
      <div className="lightbox-toolbar" style={{ top: 30, background: 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {currentMedia.folder || 'Story'}
          </span>
        </div>
        <div className="lightbox-actions">
          <button className="icon-btn" onClick={onClose}>
            <X size={24} color="white" />
          </button>
        </div>
      </div>

      {/* Media Content */}
      <div 
        style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
        onPointerLeave={() => setIsPaused(false)}
      >
        {currentMedia.type === 'image' ? (
          <img 
            src={currentMedia.url} 
            alt={currentMedia.name} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            draggable="false"
          />
        ) : (
          <video 
            ref={videoRef}
            src={currentMedia.url} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            playsInline
          />
        )}
      </div>

      {/* Invisible Tap Zones for Navigation */}
      <div 
        style={{ position: 'absolute', top: '100px', bottom: '100px', left: 0, width: '30%', zIndex: 5 }}
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
      />
      <div 
        style={{ position: 'absolute', top: '100px', bottom: '100px', right: 0, width: '30%', zIndex: 5 }}
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
      />
    </div>
  );
}
