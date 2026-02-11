import React from 'react'
import { Song } from '../types'
import './SongCard.css'

interface SongCardProps {
  song: Song
  language: string
  seed: number
}

const SongCard: React.FC<SongCardProps> = ({ song }) => {
  return (
    <div className="song-card">
      <div className="card-cover">
        {song.coverImageBase64 ? (
          <img src={song.coverImageBase64} alt={`${song.album} cover`} />
        ) : (
          <div className="cover-placeholder">
            <span>{song.album.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="card-info">
        <h3 className="card-title">{song.title}</h3>
        <p className="card-artist">{song.artist}</p>
        <p className="card-album">{song.album}</p>
        <div className="card-meta">
          <span className="card-genre">{song.genre}</span>
          <span className="card-likes">👍 {song.likes}</span>
        </div>
      </div>
    </div>
  )
}

export default SongCard

