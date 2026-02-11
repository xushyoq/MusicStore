import React, { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { Song } from '../types'
import './MusicPlayer.css'

interface MusicPlayerProps {
  song: Song
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(132) // 2:12 in seconds
  const [volume, setVolume] = useState(0.7)
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const sequenceRef = useRef<Tone.Sequence | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    // Initialize Tone.js
    if (song.musicDataBase64) {
      try {
        const musicDataJson = atob(song.musicDataBase64)
        const musicData = JSON.parse(musicDataJson)
        initializeMusic(musicData)
      } catch (error) {
        console.error('Error parsing music data:', error)
      }
    }

    return () => {
      cleanup()
    }
  }, [song.musicDataBase64])

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const elapsed = Tone.now() - startTimeRef.current
        const newProgress = Math.min((elapsed / duration) * 100, 100)
        setProgress(newProgress)

        if (newProgress >= 100) {
          setIsPlaying(false)
          setProgress(0)
        }
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isPlaying, duration])

  const initializeMusic = (musicData: any) => {
    if (synthRef.current) {
      synthRef.current.dispose()
    }

    const synth = new Tone.PolySynth(Tone.Synth).toDestination()
    synth.volume.value = Tone.gainToDb(volume)
    synthRef.current = synth

    // Generate simple melody from notes
    const notes = musicData.notes || []
    const tempo = musicData.tempo || 120

    if (notes.length > 0) {
      const sequence = new Tone.Sequence(
        (time, note) => {
          synth.triggerAttackRelease(note, '8n', time)
        },
        notes,
        '8n'
      )

      sequenceRef.current = sequence
    }
  }

  const cleanup = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop()
      sequenceRef.current.dispose()
      sequenceRef.current = null
    }
    if (synthRef.current) {
      synthRef.current.dispose()
      synthRef.current = null
    }
  }

  const handlePlayPause = async () => {
    if (!synthRef.current || !sequenceRef.current) {
      // Initialize music if not already done
      if (song.musicDataBase64) {
        try {
          const musicDataJson = atob(song.musicDataBase64)
          const musicData = JSON.parse(musicDataJson)
          initializeMusic(musicData)
          await Tone.start()
          if (sequenceRef.current) {
            startTimeRef.current = Tone.now()
            sequenceRef.current.start(0)
            setIsPlaying(true)
          }
        } catch (error) {
          console.error('Error initializing music:', error)
        }
      }
      return
    }

    if (isPlaying) {
      sequenceRef.current.stop()
      setIsPlaying(false)
    } else {
      await Tone.start()
      startTimeRef.current = Tone.now()
      sequenceRef.current.start(0)
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(newVolume)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="music-player">
      <button onClick={handlePlayPause} className="play-pause-btn">
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className="volume-control">
        <span>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="time-display">{formatTime(duration)}</span>
      </div>
    </div>
  )
}

export default MusicPlayer

