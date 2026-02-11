import axios from 'axios'
import { SongsPage, Song } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchSongs = async (
  language: string,
  seed: number,
  likes: number,
  page: number
): Promise<SongsPage> => {
  const response = await axios.get<SongsPage>(`${API_BASE_URL}/songs`, {
    params: { language, seed, likes, page }
  })
  return response.data
}

export const fetchSongDetails = async (
  index: number,
  language: string,
  seed: number
): Promise<Song> => {
  const response = await axios.get<Song>(`${API_BASE_URL}/songs/${index}`, {
    params: { language, seed }
  })
  return response.data
}

