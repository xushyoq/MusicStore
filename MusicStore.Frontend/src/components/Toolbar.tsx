import React from 'react'
import './Toolbar.css'

interface ToolbarProps {
  language: string
  seed: number
  likes: number
  viewMode: 'table' | 'gallery'
  onLanguageChange: (lang: string) => void
  onSeedChange: (seed: number) => void
  onLikesChange: (likes: number) => void
  onViewModeChange: (mode: 'table' | 'gallery') => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  language,
  seed,
  likes,
  viewMode,
  onLanguageChange,
  onSeedChange,
  onLikesChange,
  onViewModeChange
}) => {
  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 100000000)
    onSeedChange(randomSeed)
  }

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1 className="logo">iLearning</h1>
        
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="language-select"
        >
          <option value="en-US">English (US)</option>
          <option value="de-DE">German (Germany)</option>
          <option value="uk-UA">Ukrainian (Ukraine)</option>
        </select>

        <div className="seed-input-group">
          <input
            type="number"
            value={seed}
            onChange={(e) => onSeedChange(Number(e.target.value))}
            className="seed-input"
          />
          <button onClick={handleRandomSeed} className="shuffle-btn" title="Random seed">
            🔀
          </button>
        </div>

        <div className="likes-slider-group">
          <label>Likes:</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={likes}
            onChange={(e) => onLikesChange(Number(e.target.value))}
            className="likes-slider"
          />
          <span className="likes-value">{likes.toFixed(1)}</span>
        </div>
      </div>

      <div className="toolbar-right">
        <button
          onClick={() => onViewModeChange('gallery')}
          className={`view-btn ${viewMode === 'gallery' ? 'active' : ''}`}
          title="Gallery View"
        >
          ⬜
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
          title="Table View"
        >
          ☰
        </button>
      </div>
    </div>
  )
}

export default Toolbar

