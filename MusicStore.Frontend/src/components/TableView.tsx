import React, { useState } from 'react'
import { Song } from '../types'
import SongDetail from './SongDetail'
import './TableView.css'

interface TableViewProps {
  songs: Song[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading: boolean
  language: string
  seed: number
}

const TableView: React.FC<TableViewProps> = ({
  songs,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  language,
  seed
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleRowClick = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="table-view">
      <table className="songs-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Song</th>
            <th>Artist</th>
            <th>Album</th>
            <th>Genre</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <React.Fragment key={song.index}>
              <tr
                className={`table-row ${expandedIndex === song.index ? 'expanded' : ''}`}
                onClick={() => handleRowClick(song.index)}
              >
                <td>
                  {expandedIndex === song.index ? '▲' : '▼'}
                </td>
                <td>{song.title}</td>
                <td>{song.artist}</td>
                <td>{song.album}</td>
                <td>{song.genre}</td>
              </tr>
              {expandedIndex === song.index && (
                <tr>
                  <td colSpan={5}>
                    <SongDetail song={song} language={language} seed={seed} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-btn"
        >
          ←
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          →
        </button>
      </div>
    </div>
  )
}

export default TableView

