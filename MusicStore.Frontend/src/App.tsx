import { useState, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import TableView from './components/TableView'
import GalleryView from './components/GalleryView'
import { Song } from './types'
import { fetchSongs } from './services/api'

function App() {
  const [language, setLanguage] = useState('en-US')
  const [seed, setSeed] = useState(58933423)
  const [likes, setLikes] = useState(5.0)
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table')
  const [songs, setSongs] = useState<Song[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSongs()
  }, [language, seed, likes, currentPage])

  const loadSongs = async () => {
    setLoading(true)
    try {
      const data = await fetchSongs(language, seed, likes, currentPage)
      setSongs(data.songs)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error loading songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedChange = (newSeed: number) => {
    setSeed(newSeed)
    setCurrentPage(1) // Reset to first page
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setCurrentPage(1)
  }

  const handleLikesChange = (newLikes: number) => {
    setLikes(newLikes)
    // Don't reset page for likes change
  }

  const handleViewModeChange = (mode: 'table' | 'gallery') => {
    setViewMode(mode)
    if (mode === 'table') {
      setCurrentPage(1) // Reset to first page when switching to table
    }
    // For gallery, reset happens in GalleryView component
  }

  return (
    <div className="app">
      <Toolbar
        language={language}
        seed={seed}
        likes={likes}
        viewMode={viewMode}
        onLanguageChange={handleLanguageChange}
        onSeedChange={handleSeedChange}
        onLikesChange={handleLikesChange}
        onViewModeChange={handleViewModeChange}
      />
      
      {viewMode === 'table' ? (
        <TableView
          songs={songs}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          loading={loading}
          language={language}
          seed={seed}
        />
      ) : (
        <GalleryView
          songs={songs}
          language={language}
          seed={seed}
          loading={loading}
        />
      )}
    </div>
  )
}

export default App

