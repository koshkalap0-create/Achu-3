/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const MediaContext = createContext();

export const useMedia = () => useContext(MediaContext);

// Auto-load media from src/media/photos
const mediaModules = import.meta.glob('/src/media/photos/*.{jpg,jpeg,png,gif,webp,mp4,webm}', { eager: true, query: '?url', import: 'default' });
const initialMedia = Object.keys(mediaModules).map((path, index) => {
  const filename = path.split('/').pop();
  const isVideo = filename.match(/\.(mp4|webm)$/i);
  return {
    id: "local-media-" + index,
    name: filename,
    type: isVideo ? 'video' : 'image',
    folder: 'Local Media',
    url: mediaModules[path],
    file: null
  };
});

export const MediaProvider = ({ children }) => {
  const [mediaFiles, setMediaFiles] = useState(initialMedia);

  const [activeFolder, setActiveFolder] = useState(null);

  const addMediaFiles = (files) => {
    const newMedia = files.map(file => {
      let folderName = 'Uncategorized';
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 1) {
          folderName = parts[0];
        }
      }

      const isVideo = file.type.startsWith('video/');

      return {
        id: crypto.randomUUID(),
        name: file.name,
        type: isVideo ? 'video' : 'image',
        folder: folderName,
        url: URL.createObjectURL(file),
        file: file
      };
    });

    setMediaFiles(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (id) => {
    setMediaFiles(prev => prev.filter(m => m.id !== id));
  };

  const renameMedia = (id, newName) => {
    setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  const folders = Array.from(new Set(mediaFiles.map(m => m.folder).filter(Boolean)));

  const value = {
    mediaFiles, setMediaFiles,
    activeFolder, setActiveFolder,
    addMediaFiles,
    removeMedia,
    renameMedia,
    folders
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};
