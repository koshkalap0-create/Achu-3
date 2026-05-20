import { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Film,
  Folder,
  Play
} from 'lucide-react';

import { useMedia } from '../context/MediaContext';

import Lightbox from './Lightbox';
import StoryViewer from './StoryViewer';

export default function MediaGallery() {

  const {
    mediaFiles,
    addMediaFiles,
    activeFolder,
    setActiveFolder
  } = useMedia();

  // FIXED FOLDERS
  const folders = ['Our Pics', 'Family Pics'];

  // STATES
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState('Our Pics');

  // FILE UPLOAD
  const handleFileUpload = (e) => {

    const files = Array.from(e.target.files).map(file => ({

      file,

      customFolder: selectedFolder

    }));

    addMediaFiles(files);

  };

  // FILTER MEDIA
  const displayedMedia = activeFolder
    ? mediaFiles.filter(
        media => media.folder === activeFolder
      )
    : mediaFiles;

  return (

    <div
      className="main-content"
      style={{
        height: '100vh',
        paddingBottom: 0
      }}
    >

      {/* HEADER */}
      <header className="header">

        <h1 className="page-title">

          {
            activeFolder
              ? `Folder: ${activeFolder}`
              : 'Media Gallery'
          }

        </h1>

        {/* RIGHT SIDE */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >

          {/* FOLDER SELECT */}
          <select
            value={selectedFolder}
            onChange={(e) =>
              setSelectedFolder(e.target.value)
            }
            style={{
              padding: '10px',
              borderRadius: '10px',
              background: '#111',
              color: 'white',
              border: '1px solid #333',
              outline: 'none'
            }}
          >

            <option value="Our Pics">
              Our Pics
            </option>

            <option value="Family Pics">
              Family Pics
            </option>

          </select>

          {/* UPLOAD BUTTON */}
          <label className="upload-btn">

            <Upload size={18} />

            Upload Media

            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden-input"
            />

          </label>

        </div>

      </header>

      {/* ALBUMS */}
      {
        !activeFolder && folders.length > 0 && (

          <>

            <h2
              style={{
                fontSize: '16px',
                marginBottom: '12px',
                color: 'var(--text-secondary)'
              }}
            >
              Albums
            </h2>

            <div
              className="grid-view"
              style={{
                marginBottom: '32px'
              }}
            >

              {
                folders.map(folder => (

                  <div
                    key={folder}
                    className="folder-card"
                    onClick={() =>
                      setActiveFolder(folder)
                    }
                  >

                    <Folder
                      size={32}
                      style={{
                        margin: '0 auto 12px',
                        color: 'var(--accent-color)'
                      }}
                    />

                    <h3>{folder}</h3>

                    <p>

                      {
                        mediaFiles.filter(
                          media =>
                            media.folder === folder
                        ).length
                      }

                      {' '}items

                    </p>

                  </div>

                ))
              }

            </div>

          </>

        )
      }

      {/* BACK + STORY */}
      {
        activeFolder && (

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}
          >

            <button
              className="back-btn"
              style={{
                marginBottom: 0
              }}
              onClick={() =>
                setActiveFolder(null)
              }
            >

              ← Back to Albums

            </button>

            <button
              className="upload-btn"
              onClick={() =>
                setShowStoryViewer(true)
              }
            >

              <Play size={16} />

              Play Story

            </button>

          </div>

        )
      }

      {/* MEDIA */}
      {
        displayedMedia.length > 0 ? (

          <>

            <h2
              style={{
                fontSize: '16px',
                marginBottom: '12px',
                color: 'var(--text-secondary)'
              }}
            >
              All Media
            </h2>

            <div className="media-grid">

              {
                displayedMedia.map(
                  (media, index) => (

                    <div
                      key={media.id}
                      className="media-thumbnail"
                      onClick={() =>
                        setLightboxIndex(index)
                      }
                    >

                      {
                        media.type === 'image' ? (

                          <img
                            src={media.url}
                            alt={media.name}
                            loading="lazy"
                          />

                        ) : (

                          <div className="video-thumbnail-wrapper">

                            <video
                              src={media.url}
                              preload="metadata"
                            />

                            <div className="video-icon-overlay">

                              <Film
                                size={24}
                                color="white"
                              />

                            </div>

                          </div>

                        )
                      }

                    </div>

                  )
                )
              }

            </div>

          </>

        ) : (

          <div className="empty-state">

            <ImageIcon className="empty-icon" />

            <h2 className="empty-title">
              No Media Found
            </h2>

            <p>
              Upload photos and videos to see them here.
            </p>

          </div>

        )
      }

      {/* LIGHTBOX */}
      {
        lightboxIndex !== null && (

          <Lightbox
            initialIndex={lightboxIndex}
            displayedMedia={displayedMedia}
            onClose={() =>
              setLightboxIndex(null)
            }
          />

        )
      }

      {/* STORY VIEWER */}
      {
        showStoryViewer &&
        displayedMedia.length > 0 && (

          <StoryViewer
            mediaList={displayedMedia}
            initialIndex={0}
            onClose={() =>
              setShowStoryViewer(false)
            }
          />

        )
      }

    </div>

  );

}