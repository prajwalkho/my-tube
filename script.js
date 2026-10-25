// Keep this catalog as the single source of truth for the bundled media.
const videos = [
  { title: "C# Overview", poster: "5th_video_poster.jpg", file: "5th_video_poster.mp4", description: "A concise overview of the C# programming language.", category: "Programming" },
  { title: "C vs C++ vs C#", poster: "C_programming.jpg", file: "C_programming.mp4", description: "A comparison of three popular C-family programming languages.", category: "Programming" },
  { title: "Data Structures and Their Importance", poster: "Data Structure.jpg", file: "Data Structure.mp4", description: "An introduction to data structures and why they matter.", category: "Programming" },
  { title: "How to Learn C Programming", poster: "How to Learn C Programming Language.jpg", file: "How to Learn C Programming Language.mp4", description: "A guide to getting started with the C programming language.", category: "Programming" },
  { title: "HTML, CSS, and JavaScript Explained", poster: "HTML, CSS,JAVASCRIPT EXAPLAINED.jpg", file: "HTML, CSS,JAVASCRIPT EXAPLAINED.mp4", description: "An overview of the core technologies used to build websites.", category: "Web development" },
  { title: "Introducing MyTube", poster: "my tube.jpg", file: "my tube.mp4", description: "An introduction to the MyTube video collection.", category: "Web development" },
  { title: "PC Assembly", poster: "PC assembly.jpg", file: "PC assembly.mp4", description: "A practical introduction to assembling a computer.", category: "PC building" },
  { title: "Frontend and Backend Development", poster: "What is fronted and backend devlopment.jpg", file: "What is fronted and backend devlopment.mp4", description: "Learn the difference between frontend and backend development.", category: "Web development" },
  { title: "What Are HTML, CSS, and JavaScript?", poster: "What Is HTML,CSS,JS.jpg", file: "What Is HTML,CSS,JS.mp4", description: "A beginner-friendly overview of HTML, CSS, and JavaScript.", category: "Web development" }
];

const $ = (selector, root = document) => root.querySelector(selector);
const grid = $('#movieContainer');
const upNext = $('#upNext');
const searchInput = $('#searchInput');
const videoPlayer = $('#myVideo');
const browseView = $('#browseView');
const watchView = $('#watchView');
const emptyState = $('#emptyState');
const pageTitle = $('#pageTitle');
const videoCount = $('#videoCount');
const storageKey = 'mytube.v1.';
let storageAvailable = true;
try {
  const probe = storageKey + 'probe';
  localStorage.setItem(probe, '1');
  localStorage.removeItem(probe);
} catch { storageAvailable = false; }
const readStorage = (key, fallback) => {
  if (!storageAvailable) return fallback;
  try { return JSON.parse(localStorage.getItem(storageKey + key)) ?? fallback; }
  catch { return fallback; }
};
const saveStorage = (key, value) => {
  if (!storageAvailable) return false;
  try { localStorage.setItem(storageKey + key, JSON.stringify(value)); return true; }
  catch {
    storageAvailable = false;
    $('#storageNotice').textContent = 'Browser storage is full or unavailable. Changes remain only until this page closes.';
    return false;
  }
};
let favorites = Array.isArray(readStorage('favorites', [])) ? readStorage('favorites', []) : [];
let history = Array.isArray(readStorage('history', [])) ? readStorage('history', []) : [];
let positions = readStorage('positions', {});
let durations = readStorage('durations', {});
let activeCategory = 'All';
let activeView = 'home';
let currentVideo = null;
let searchTerm = '';
let lastPositionSave = 0;
let returnState = { view: 'home', category: 'All', query: '' };
if (!storageAvailable) $('#storageNotice').textContent = 'Browser storage is unavailable. Favorites and history last only until this page closes.';

function assetUrl(folder, filename) {
  return folder + '/' + encodeURIComponent(filename).replaceAll('%2C', ',');
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  return hours ? hours + ':' + String(minutes).padStart(2, '0') + ':' + String(remainder).padStart(2, '0') : minutes + ':' + String(remainder).padStart(2, '0');
}

function setFavorite(item, value) {
  favorites = value ? Array.from(new Set(favorites.concat(item.file))) : favorites.filter(file => file !== item.file);
  saveStorage('favorites', favorites);
  if (activeView === 'favorites') render();
}

function updateWatchFavorite(item) {
  const isFavorite = favorites.includes(item.file);
  const button = $('#watchFavoriteButton');
  button.textContent = (isFavorite ? '♥ In Favorites' : '♡ Add to Favorites');
  button.setAttribute('aria-label', (isFavorite ? 'Remove from' : 'Add to') + ' favorites: ' + item.title);
  button.setAttribute('aria-pressed', String(isFavorite));
  button.classList.toggle('is-favorite', isFavorite);
}

function createCard(item, compact = false) {
  const card = document.createElement('article');
  card.className = 'video-card';
  const thumbnailWrap = document.createElement('div');
  thumbnailWrap.className = 'thumbnail-wrap';
  const openButton = document.createElement('button');
  openButton.className = 'thumbnail-button';
  openButton.type = 'button';
  openButton.setAttribute('aria-label', 'Play ' + item.title);
  const poster = document.createElement('img');
  poster.className = 'thumbnail';
  if (item.poster) {
    poster.src = assetUrl('photo', item.poster);
    poster.alt = item.title + ' thumbnail';
    poster.loading = compact ? 'lazy' : 'eager';
    poster.addEventListener('error', () => {
      poster.removeAttribute('src');
      poster.alt = item.title + ' thumbnail unavailable';
      thumbnailWrap.classList.add('thumbnail-missing');
    }, { once: true });
    openButton.append(poster);
  } else {
    thumbnailWrap.classList.add('thumbnail-missing');
    poster.alt = item.title + ' thumbnail unavailable';
    openButton.append(poster);
  }
  const duration = durations[item.file];
  if (Number.isFinite(duration) && duration > 0) {
    const badge = document.createElement('span');
    badge.className = 'duration';
    badge.textContent = formatTime(duration);
    openButton.append(badge);
  }
  openButton.addEventListener('click', () => openVideo(item));
  thumbnailWrap.append(openButton);

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className = 'favorite-button' + (favorites.includes(item.file) ? ' is-favorite' : '');
  favoriteButton.textContent = favorites.includes(item.file) ? '♥' : '♡';
  favoriteButton.setAttribute('aria-label', (favorites.includes(item.file) ? 'Remove from' : 'Add to') + ' favorites: ' + item.title);
  favoriteButton.setAttribute('aria-pressed', String(favorites.includes(item.file)));
  favoriteButton.addEventListener('click', () => {
    const isFavorite = !favorites.includes(item.file);
    setFavorite(item, isFavorite);
    favoriteButton.classList.toggle('is-favorite', isFavorite);
    favoriteButton.textContent = isFavorite ? '♥' : '♡';
    favoriteButton.setAttribute('aria-pressed', String(isFavorite));
    favoriteButton.setAttribute('aria-label', (isFavorite ? 'Remove from' : 'Add to') + ' favorites: ' + item.title);
  });
  thumbnailWrap.append(favoriteButton);

  const info = document.createElement('div');
  info.className = 'card-info';
  const avatar = document.createElement('span');
  avatar.className = 'channel-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = 'M';
  const copy = document.createElement('div');
  copy.className = 'card-copy';
  const title = document.createElement('button');
  title.className = 'title-button';
  title.type = 'button';
  title.textContent = item.title;
  title.addEventListener('click', () => openVideo(item));
  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = item.category + ' · ' + item.description;
  copy.append(title, description);
  info.append(avatar, copy);
  card.append(thumbnailWrap, info);
  return card;
}

function matchingVideos() {
  let list = activeView === 'history' ? history.map(file => videos.find(item => item.file === file)).filter(Boolean) : videos;
  if (activeView === 'favorites') list = list.filter(item => favorites.includes(item.file));
  if (activeCategory !== 'All' && ['home', 'library'].includes(activeView)) list = list.filter(item => item.category === activeCategory);
  if (searchTerm) list = list.filter(item => (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(searchTerm));
  const sort = $('#sortSelect').value;
  if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'duration') list.sort((a, b) => (durations[a.file] || Infinity) - (durations[b.file] || Infinity));
  return list;
}

function render() {
  const list = matchingVideos();
  grid.replaceChildren(...list.map(item => createCard(item)));
  grid.hidden = list.length === 0;
  emptyState.hidden = list.length !== 0;
  videoCount.textContent = list.length + (list.length === 1 ? ' video' : ' videos');
  const emptyCopy = {
    favorites: ['No favorites yet', 'Tap the heart on a video to keep it here.'],
    history: ['Nothing watched yet', 'Videos you open will appear here on this browser.'],
    default: ['No videos found', 'Try a different search or topic.']
  };
  const copy = emptyCopy[activeView] || emptyCopy.default;
  $('#emptyTitle').textContent = copy[0];
  $('#emptyMessage').textContent = copy[1];
  $('#clearSearch').hidden = !searchTerm && activeCategory === 'All';
  $('#clearHistoryButton').hidden = activeView !== 'history' || history.length === 0;
  $('#sortSelect').value = readStorage('sort', 'recent');
}

function selectView(view) {
  activeView = view;
  activeCategory = 'All';
  $('.filter-chip.selected')?.classList.remove('selected');
  $('[data-category="All"]').classList.add('selected');
  const titles = { home: 'Discover', library: 'Your library', favorites: 'Favorites', history: 'Watch history' };
  pageTitle.textContent = titles[view] || 'Discover';
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  $('.filter-row').hidden = !['home', 'library'].includes(view);
  $('#libraryTools').hidden = view === 'history';
  searchTerm = '';
  searchInput.value = '';
  watchView.hidden = true;
  browseView.hidden = false;
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  render();
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: motionBehavior() });
}

function motionBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
}

function openVideo(item) {
  returnState = { view: activeView, category: activeCategory, query: searchTerm };
  currentVideo = item;
  history = [item.file].concat(history.filter(file => file !== item.file)).slice(0, 50);
  saveStorage('history', history);
  $('#watchTitle').textContent = item.title;
  $('#watchDescription').textContent = item.description;
  $('#watchCategory').textContent = item.category;
  updateWatchFavorite(item);
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  videoPlayer.querySelectorAll('track').forEach(track => track.remove());
  $('#playerError').hidden = true;
  $('#playerLoading').hidden = false;
  $('#resumeStatus').hidden = true;
  $('#captionStatus').textContent = item.captions ? 'Captions are available in the player controls.' : 'Captions are not available for this video.';
  $('#speedControl').hidden = false;
  videoPlayer.hidden = false;
  videoPlayer.poster = assetUrl('photo', item.poster);
  videoPlayer.src = assetUrl('video', item.file);
  if (item.captions) {
    const captions = document.createElement('track');
    captions.kind = 'captions';
    captions.srclang = item.captionLanguage || 'en';
    captions.label = item.captionLabel || 'Captions';
    captions.src = assetUrl('video', item.captions);
    captions.default = true;
    videoPlayer.append(captions);
  }
  videoPlayer.onerror = () => { $('#playerLoading').hidden = true; $('#playerError').hidden = false; };
  videoPlayer.onwaiting = () => { $('#playerLoading').hidden = false; };
  videoPlayer.onplaying = () => { $('#playerLoading').hidden = true; };
  videoPlayer.onloadeddata = () => {
    $('#playerLoading').hidden = true;
    $('#playerError').hidden = true;
  };
  videoPlayer.onloadedmetadata = () => {
    if (Number.isFinite(videoPlayer.duration) && videoPlayer.duration > 0) {
      durations[item.file] = videoPlayer.duration;
      saveStorage('durations', durations);
      const durationOption = $('#sortSelect option[value="duration"]');
      if (durationOption) durationOption.disabled = false;
      const resumeAt = Number(positions[item.file]) || 0;
      if (resumeAt > 5 && resumeAt < videoPlayer.duration - 3) {
        videoPlayer.currentTime = resumeAt;
        $('#resumeStatus').textContent = 'Resumed near ' + formatTime(resumeAt) + ' from this browser.';
        $('#resumeStatus').hidden = false;
      }
      render();
    }
  };
  videoPlayer.onended = () => {
    delete positions[item.file];
    saveStorage('positions', positions);
    $('#resumeStatus').hidden = true;
  };
  browseView.hidden = true;
  watchView.hidden = false;
  upNext.replaceChildren(...videos.filter(video => video.file !== item.file && video.category === item.category).slice(0, 3).map(video => createCard(video, true)));
  if (!upNext.childElementCount) upNext.replaceChildren(...videos.filter(video => video.file !== item.file).slice(0, 3).map(video => createCard(video, true)));
  window.scrollTo({ top: 0, behavior: motionBehavior() });
  const savedSpeed = readStorage('speed', 1);
  $('#playbackSpeed').value = String(savedSpeed);
  videoPlayer.playbackRate = savedSpeed;
  videoPlayer.play().catch(() => {
    $('#playerLoading').hidden = true;
    $('#resumeStatus').textContent = 'Playback did not start. Press Play in the video controls.';
    $('#resumeStatus').hidden = false;
  });
}

let positionTimer;
videoPlayer.addEventListener('timeupdate', () => {
  if (!currentVideo || Date.now() - lastPositionSave < 2000) return;
  lastPositionSave = Date.now();
  if (videoPlayer.currentTime > 3 && !videoPlayer.ended) positions[currentVideo.file] = videoPlayer.currentTime;
  saveStorage('positions', positions);
});

function closeMobileSidebar() {
  document.body.classList.remove('sidebar-open');
  syncMenuState();
}
function syncMenuState() {
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const expanded = mobile ? document.body.classList.contains('sidebar-open') : !document.body.classList.contains('sidebar-collapsed');
  $('#menuButton').setAttribute('aria-expanded', String(expanded));
}
$('#menuButton').addEventListener('click', () => {
  if (window.matchMedia('(max-width: 700px)').matches) document.body.classList.toggle('sidebar-open');
  else document.body.classList.toggle('sidebar-collapsed');
  syncMenuState();
});
window.addEventListener('resize', syncMenuState);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileSidebar(); });
document.addEventListener('click', event => {
  if (document.body.classList.contains('sidebar-open') && !$('#sidebar').contains(event.target) && !$('#menuButton').contains(event.target)) closeMobileSidebar();
});
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => selectView(button.dataset.view)));
document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
  activeCategory = button.dataset.category;
  document.querySelector('.filter-chip.selected')?.classList.remove('selected');
  button.classList.add('selected');
  render();
}));
searchInput.addEventListener('input', () => { searchTerm = searchInput.value.trim().toLowerCase(); render(); });
$('#searchForm').addEventListener('submit', event => { event.preventDefault(); searchInput.blur(); });
$('#clearSearch').addEventListener('click', () => {
  searchTerm = '';
  searchInput.value = '';
  activeCategory = 'All';
  $('.filter-chip.selected')?.classList.remove('selected');
  $('[data-category="All"]').classList.add('selected');
  render();
  searchInput.focus();
});
$('#sortSelect').addEventListener('change', event => { saveStorage('sort', event.target.value); render(); });
$('#playbackSpeed').addEventListener('change', event => {
  const speed = Number(event.target.value);
  videoPlayer.playbackRate = speed;
  saveStorage('speed', speed);
});
$('#watchFavoriteButton').addEventListener('click', () => {
  if (!currentVideo) return;
  setFavorite(currentVideo, !favorites.includes(currentVideo.file));
  updateWatchFavorite(currentVideo);
});
$('#clearHistoryButton').addEventListener('click', () => {
  if (!history.length) return;
  const confirmed = window.confirm('Clear watch history and saved playback progress from this browser? This cannot be undone.');
  if (!confirmed) return;
  history = [];
  positions = {};
  let removed = false;
  try {
    localStorage.removeItem(storageKey + 'history');
    localStorage.removeItem(storageKey + 'positions');
    removed = true;
  } catch {
    storageAvailable = false;
  }
  if (!removed) $('#storageNotice').textContent = 'Could not remove saved history from browser storage. Clear this site’s data in your browser settings to remove it.';
  render();
});
$('#backButton').addEventListener('click', () => {
  videoPlayer.pause();
  watchView.hidden = true;
  browseView.hidden = false;
  activeView = returnState.view;
  activeCategory = returnState.category;
  searchTerm = returnState.query;
  searchInput.value = searchTerm;
  pageTitle.textContent = ({ home: 'Discover', library: 'Your library', favorites: 'Favorites', history: 'Watch history' })[activeView];
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === activeView));
  $('.filter-row').hidden = !['home', 'library'].includes(activeView);
  $('#libraryTools').hidden = activeView === 'history';
  document.querySelectorAll('.filter-chip').forEach(button => button.classList.toggle('selected', button.dataset.category === activeCategory));
  render();
  window.scrollTo({ top: 0, behavior: motionBehavior() });
});
$('#brandHome').addEventListener('click', event => { event.preventDefault(); selectView('home'); });
const savedSort = readStorage('sort', 'recent');
$('#sortSelect').value = savedSort;
$('#sortSelect option[value="duration"]').disabled = Object.keys(durations).length === 0;
syncMenuState();
render();
