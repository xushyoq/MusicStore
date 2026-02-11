import React, { useEffect, useState } from 'react'
import { Song } from '../types'
import { fetchSongDetails } from '../services/api'
import MusicPlayer from './MusicPlayer'
import './SongDetail.css'

interface SongDetailProps {
  song: Song
  language: string
  seed: number
}

const SongDetail: React.FC<SongDetailProps> = ({ song: initialSong, language, seed }) => {
  const [song, setSong] = useState<Song>(initialSong)
  const [loading, setLoading] = useState(!initialSong.coverImageBase64)

  useEffect(() => {
    if (!initialSong.coverImageBase64) {
      loadDetails()
    }
  }, [initialSong.index, language, seed])

  const loadDetails = async () => {
    setLoading(true)
    try {
      const details = await fetchSongDetails(initialSong.index, language, seed)
      setSong(details)
    } catch (error) {
      console.error('Error loading song details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="song-detail-loading">Loading details...</div>
  }

  return (
    <div className="song-detail">
      <div className="detail-content">
        <div className="detail-cover">
          {song.coverImageBase64 ? (
            <img src={song.coverImageBase64} alt={`${song.album} cover`} />
          ) : (
            <div className="cover-placeholder-large">
              <span>{song.album.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="detail-info">
          <h2 className="detail-title">{song.title}</h2>
          
          <MusicPlayer song={song} />

          <div className="detail-meta">
            <p className="detail-album-info">
              from <strong>{song.album}</strong> by <strong>{song.artist}</strong>
            </p>
            <p className="detail-label">Apple Records, 2019</p>
          </div>

          <div className="detail-likes">
            <button className="likes-btn">
              👍 {song.likes}
            </button>
          </div>

          {song.review && (
            <div className="detail-review">
              <h3>Review</h3>
              <p>{song.review}</p>
            </div>
          )}

          {song.lyrics && song.lyrics.length > 0 && (
            <div className="detail-lyrics">
              <h3>Lyrics</h3>
              <div className="lyrics-content">
                {song.lyrics.map((line, index) => (
                  <p key={index} className={index === 2 ? 'lyrics-highlight' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongDetail

