import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'
import { MediaProvider } from './context/MediaContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { FamilyProvider } from './context/FamilyContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <FamilyProvider>
          <PlayerProvider>
            <MediaProvider>
              <App />
            </MediaProvider>
          </PlayerProvider>
        </FamilyProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
