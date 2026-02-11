// API Configuration
const API_BASE_URL = '/api';

// State
let state = {
  language: 'en-US',
  seed: 58933423,
  likes: 5.0,
  viewMode: 'gallery',
  songs: [],
  currentPage: 1,
  totalPages: 1,
  loading: false,
  expandedIndex: null,
  selectedSong: null,
  galleryPage: 1,
  hasMore: true
};

// DOM Elements
const elements = {
  languageSelect: null,
  seedInput: null,
  randomSeedBtn: null,
  likesSlider: null,
  likesValue: null,
  galleryViewBtn: null,
  tableViewBtn: null,
  tableView: null,
  galleryView: null,
  songsTableBody: null,
  pagination: null,
  galleryGrid: null,
  songDetail: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  attachEventListeners();
  loadSongs();
});

function initializeElements() {
  elements.languageSelect = document.getElementById('languageSelect');
  elements.seedInput = document.getElementById('seedInput');
  elements.randomSeedBtn = document.getElementById('randomSeedBtn');
  elements.likesSlider = document.getElementById('likesSlider');
  elements.likesValue = document.getElementById('likesValue');
  elements.galleryViewBtn = document.getElementById('galleryViewBtn');
  elements.tableViewBtn = document.getElementById('tableViewBtn');
  elements.tableView = document.getElementById('tableView');
  elements.galleryView = document.getElementById('galleryView');
  elements.songsTableBody = document.getElementById('songsTableBody');
  elements.pagination = document.getElementById('pagination');
  elements.galleryGrid = document.getElementById('galleryGrid');
  elements.songDetail = document.getElementById('songDetail');
}

function attachEventListeners() {
  elements.languageSelect?.addEventListener('change', (e) => {
    state.language = e.target.value;
    state.currentPage = 1;
    state.galleryPage = 1;
    state.hasMore = true;
    loadSongs();
  });

  elements.seedInput?.addEventListener('change', (e) => {
    state.seed = parseInt(e.target.value) || 58933423;
    state.currentPage = 1;
    state.galleryPage = 1;
    state.hasMore = true;
    loadSongs();
  });

  elements.randomSeedBtn?.addEventListener('click', () => {
    state.seed = Math.floor(Math.random() * 100000000);
    elements.seedInput.value = state.seed;
    state.currentPage = 1;
    state.galleryPage = 1;
    state.hasMore = true;
    loadSongs();
  });

  elements.likesSlider?.addEventListener('input', (e) => {
    state.likes = parseFloat(e.target.value);
    elements.likesValue.textContent = state.likes.toFixed(1);
    loadSongs();
  });

  elements.galleryViewBtn?.addEventListener('click', () => {
    switchViewMode('gallery');
  });

  elements.tableViewBtn?.addEventListener('click', () => {
    switchViewMode('table');
  });

  // Infinite scroll for gallery
  elements.galleryView?.addEventListener('scroll', handleGalleryScroll);
}

function switchViewMode(mode) {
  state.viewMode = mode;
  
  if (mode === 'gallery') {
    elements.galleryViewBtn?.classList.add('active');
    elements.tableViewBtn?.classList.remove('active');
    elements.tableView.style.display = 'none';
    elements.galleryView.style.display = 'block';
    state.currentPage = 1;
    state.galleryPage = 1;
    state.hasMore = true;
    loadSongs();
  } else {
    elements.tableViewBtn?.classList.add('active');
    elements.galleryViewBtn?.classList.remove('active');
    elements.galleryView.style.display = 'none';
    elements.tableView.style.display = 'flex';
    state.currentPage = 1;
    loadSongs();
  }
}

async function loadSongs() {
  state.loading = true;
  updateLoadingState();
  
  try {
    const page = state.viewMode === 'table' ? state.currentPage : state.galleryPage;
    const response = await fetch(
      `${API_BASE_URL}/songs?language=${state.language}&seed=${state.seed}&likes=${state.likes}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (state.viewMode === 'table') {
      state.songs = data.songs;
      state.totalPages = data.totalPages;
      renderTableView();
    } else {
      if (state.galleryPage === 1) {
        state.songs = data.songs;
      } else {
        state.songs = [...state.songs, ...data.songs];
      }
      state.hasMore = data.songs.length > 0;
      renderGalleryView();
    }
  } catch (error) {
    console.error('Error loading songs:', error);
    showError('Failed to load songs. Please try again.');
  } finally {
    state.loading = false;
    updateLoadingState();
  }
}

function updateLoadingState() {
  if (state.loading && state.songs.length === 0) {
    if (state.viewMode === 'table') {
      elements.songsTableBody.innerHTML = '<tr><td colSpan="5" class="loading">Loading...</td></tr>';
    } else {
      elements.galleryGrid.innerHTML = '<div class="loading">Loading...</div>';
    }
  }
}

function renderTableView() {
  if (!elements.songsTableBody) return;
  
  elements.songsTableBody.innerHTML = state.songs.map(song => `
    <tr class="table-row ${state.expandedIndex === song.index ? 'expanded' : ''}" 
        onclick="toggleRowExpand(${song.index})">
      <td>${state.expandedIndex === song.index ? '▲' : '▼'}</td>
      <td>${escapeHtml(song.title)}</td>
      <td>${escapeHtml(song.artist)}</td>
      <td>${escapeHtml(song.album)}</td>
      <td>${escapeHtml(song.genre)}</td>
    </tr>
    ${state.expandedIndex === song.index ? `
    <tr>
      <td colSpan="5">
        <div id="songDetail-${song.index}"></div>
      </td>
    </tr>
    ` : ''}
  `).join('');
  
  if (state.expandedIndex !== null) {
    const detailContainer = document.getElementById(`songDetail-${state.expandedIndex}`);
    if (detailContainer) {
      loadSongDetail(state.expandedIndex, detailContainer);
    }
  }
  
  renderPagination();
}

function renderPagination() {
  if (!elements.pagination) return;
  
  const pages = [];
  const maxVisible = 5;
  
  if (state.totalPages <= maxVisible) {
    for (let i = 1; i <= state.totalPages; i++) {
      pages.push(i);
    }
  } else if (state.currentPage <= 3) {
    for (let i = 1; i <= maxVisible; i++) {
      pages.push(i);
    }
  } else if (state.currentPage >= state.totalPages - 2) {
    for (let i = state.totalPages - maxVisible + 1; i <= state.totalPages; i++) {
      pages.push(i);
    }
  } else {
    for (let i = state.currentPage - 2; i <= state.currentPage + 2; i++) {
      pages.push(i);
    }
  }
  
  elements.pagination.innerHTML = `
    <button class="page-btn" ${state.currentPage === 1 ? 'disabled' : ''} 
            onclick="changePage(${state.currentPage - 1})">←</button>
    ${pages.map(page => `
      <button class="page-btn ${state.currentPage === page ? 'active' : ''}" 
              onclick="changePage(${page})">${page}</button>
    `).join('')}
    <button class="page-btn" ${state.currentPage === state.totalPages ? 'disabled' : ''} 
            onclick="changePage(${state.currentPage + 1})">→</button>
  `;
}

function changePage(page) {
  if (page < 1 || page > state.totalPages) return;
  state.currentPage = page;
  state.expandedIndex = null;
  loadSongs();
}

function toggleRowExpand(index) {
  if (state.expandedIndex === index) {
    state.expandedIndex = null;
  } else {
    state.expandedIndex = index;
  }
  renderTableView();
}

function renderGalleryView() {
  if (!elements.galleryGrid) return;
  
  elements.galleryGrid.innerHTML = state.songs.map(song => `
    <div class="song-card" onclick="showSongDetail(${song.index})">
      <div class="card-cover">
        ${song.coverImageBase64 ? `
          <img src="${song.coverImageBase64}" alt="${escapeHtml(song.album)} cover" />
        ` : `
          <div class="cover-placeholder">
            <span>${song.album.substring(0, 2).toUpperCase()}</span>
          </div>
        `}
      </div>
      <div class="card-info">
        <h3 class="card-title">${escapeHtml(song.title)}</h3>
        <p class="card-artist">${escapeHtml(song.artist)}</p>
        <p class="card-album">${escapeHtml(song.album)}</p>
        <div class="card-meta">
          <span class="card-genre">${escapeHtml(song.genre)}</span>
          <span class="card-likes">👍 ${song.likes}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add loading indicator if has more
  if (state.hasMore && !state.loading) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && state.hasMore && !state.loading) {
        loadMoreSongs();
      }
    }, { threshold: 0.1 });
    
    const sentinel = document.createElement('div');
    sentinel.className = 'loading-sentinel';
    sentinel.style.height = '20px';
    elements.galleryGrid.appendChild(sentinel);
    observer.observe(sentinel);
  }
}

function handleGalleryScroll() {
  const gallery = elements.galleryView;
  if (!gallery) return;
  
  const scrollTop = gallery.scrollTop;
  const scrollHeight = gallery.scrollHeight;
  const clientHeight = gallery.clientHeight;
  
  if (scrollTop + clientHeight >= scrollHeight - 100 && state.hasMore && !state.loading) {
    loadMoreSongs();
  }
}

async function loadMoreSongs() {
  if (state.loading || !state.hasMore) return;
  state.galleryPage++;
  await loadSongs();
}

async function loadSongDetail(index, container) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/songs/${index}?language=${state.language}&seed=${state.seed}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const song = await response.json();
    renderSongDetail(song, container);
  } catch (error) {
    console.error('Error loading song details:', error);
    container.innerHTML = '<div class="loading">Failed to load details</div>';
  }
}

function renderSongDetail(song, container) {
  container.innerHTML = `
    <div class="song-detail">
      <div class="detail-content">
        <div class="detail-cover">
          ${song.coverImageBase64 ? `
            <img src="${song.coverImageBase64}" alt="${escapeHtml(song.album)} cover" />
          ` : `
            <div class="cover-placeholder-large">
              <span>${song.album.substring(0, 2).toUpperCase()}</span>
            </div>
          `}
        </div>
        <div class="detail-info">
          <h2 class="detail-title">${escapeHtml(song.title)}</h2>
          
          <div class="music-player" id="musicPlayer-${song.index}"></div>
          
          <div class="detail-meta">
            <p class="detail-album-info">
              from <strong>${escapeHtml(song.album)}</strong> by <strong>${escapeHtml(song.artist)}</strong>
            </p>
            <p class="detail-label">Apple Records, 2019</p>
          </div>
          
          <div class="detail-likes">
            <button class="likes-btn">👍 ${song.likes}</button>
          </div>
          
          ${song.review ? `
            <div class="detail-review">
              <h3>Review</h3>
              <p>${escapeHtml(song.review)}</p>
            </div>
          ` : ''}
          
          ${song.lyrics && song.lyrics.length > 0 ? `
            <div class="detail-lyrics">
              <h3>Lyrics</h3>
              <div class="lyrics-content">
                ${song.lyrics.map((line, i) => `
                  <p class="${i === 2 ? 'lyrics-highlight' : ''}">${escapeHtml(line)}</p>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Initialize music player if music data available
  if (song.musicDataBase64) {
    initializeMusicPlayer(song, `musicPlayer-${song.index}`);
  }
}

function initializeMusicPlayer(song, playerId) {
  // Simple music player - Tone.js would require additional setup
  const playerContainer = document.getElementById(playerId);
  if (!playerContainer) return;
  
  let isPlaying = false;
  let progress = 0;
  const duration = 132; // 2:12 in seconds
  
  playerContainer.innerHTML = `
    <button class="play-pause-btn" id="playBtn-${song.index}">▶</button>
    <div class="progress-container">
      <div class="progress-bar" id="progressBar-${song.index}">
        <div class="progress-fill" id="progressFill-${song.index}" style="width: 0%"></div>
      </div>
      <span class="time-display">${formatTime(duration)}</span>
    </div>
  `;
  
  const playBtn = document.getElementById(`playBtn-${song.index}`);
  const progressFill = document.getElementById(`progressFill-${song.index}`);
  
  playBtn?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
      const interval = setInterval(() => {
        progress += 0.1;
        const percent = Math.min((progress / duration) * 100, 100);
        if (progressFill) {
          progressFill.style.width = `${percent}%`;
        }
        
        if (progress >= duration) {
          clearInterval(interval);
          isPlaying = false;
          playBtn.textContent = '▶';
          progress = 0;
          if (progressFill) {
            progressFill.style.width = '0%';
          }
        }
      }, 100);
    }
  });
}

function showSongDetail(index) {
  state.selectedSong = index;
  elements.songDetail.style.display = 'block';
  const content = document.getElementById('songDetailContent');
  if (content) {
    content.innerHTML = '<div class="loading">Loading...</div>';
    loadSongDetail(index, content);
  }
}

function closeSongDetail() {
  elements.songDetail.style.display = 'none';
  state.selectedSong = null;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showError(message) {
  alert(message);
}

// Make functions available globally for onclick handlers
window.changePage = changePage;
window.toggleRowExpand = toggleRowExpand;
window.showSongDetail = showSongDetail;
window.closeSongDetail = closeSongDetail;

