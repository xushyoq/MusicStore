import React, { useEffect, useRef, useState } from 'react'
import { Song } from '../types'
import { fetchSongs } from '../services/api'
import SongCard from './SongCard'
import './GalleryView.css'

interface GalleryViewProps {
  songs: Song[]
  language: string
  seed: number
  loading: boolean
}

const GalleryView: React.FC<GalleryViewProps> = ({
  songs: initialSongs,
  language,
  seed,
  loading: initialLoading
}) => {
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset when language or seed changes
    setSongs(initialSongs)
    setPage(1)
    setHasMore(true)
    // Scroll to top when resetting
    window.scrollTo(0, 0)
  }, [language, seed])

  useEffect(() => {
    // Update songs when initialSongs change (e.g., when likes change)
    setSongs(initialSongs)
  }, [initialSongs])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, language, seed])

  const loadMore = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      const nextPage = page + 1
      const data = await fetchSongs(language, seed, 5.0, nextPage)
      
      if (data.songs.length === 0) {
        setHasMore(false)
      } else {
        setSongs((prev) => [...prev, ...data.songs])
        setPage(nextPage)
      }
    } catch (error) {
      console.error('Error loading more songs:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading && songs.length === 0) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="gallery-view">
      <div className="gallery-grid">
        {songs.map((song) => (
          <SongCard key={song.index} song={song} language={language} seed={seed} />
        ))}
      </div>
      <div ref={observerTarget} className="observer-target">
        {loading && <div className="loading-more">Loading more...</div>}
        {!hasMore && <div className="no-more">No more songs</div>}
      </div>
    </div>
  )
}

export default GalleryView

