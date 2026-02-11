export interface Song {
  index: number
  title: string
  artist: string
  album: string
  genre: string
  likes: number
  coverImageBase64?: string
  musicDataBase64?: string
  review?: string
  lyrics?: string[]
}

export interface SongsPage {
  songs: Song[]
  totalPages: number
  currentPage: number
  pageSize: number
}

