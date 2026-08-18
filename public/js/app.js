// ==================== GLOBAL UTILITIES ====================

/**
 * Create a proxy download URL to hide real download links
 * @param {string} url - Original download URL
 * @param {string} filename - Desired filename
 * @returns {string} Proxy URL
 */
function createProxyUrl(url, filename) {
    try {
        const encoded = btoa(unescape(encodeURIComponent(url)));
        return `/api/proxy-download?u=${encodeURIComponent(encoded)}&f=${encodeURIComponent(filename)}`;
    } catch (e) {
        console.error('Error encoding URL:', e);
        return '#';
    }
}

/**
 * Show error message
 * @param {string} msg - Error message
 * @param {number} duration - Auto-hide duration in ms (default 5000)
 */
function showError(msg, duration = 5000) {
    const err = document.getElementById('errorMsg');
    const errText = document.getElementById('errorText');
    if (!err || !errText) return;
    errText.textContent = msg;
    err.classList.remove('hidden');
    if (duration > 0) {
        setTimeout(() => hideError(), duration);
    }
}

/**
 * Hide error message
 */
function hideError() {
    const err = document.getElementById('errorMsg');
    if (err) err.classList.add('hidden');
}

/**
 * Show loading spinner
 * @param {string} text - Loading text
 */
function showLoader(text = 'Fetching video details...') {
    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text');
    if (loader) loader.classList.add('active');
    if (loaderText) loaderText.textContent = text;
}

/**
 * Hide loading spinner
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('active');
}

/**
 * Show results section
 */
function showResults() {
    const results = document.getElementById('results');
    if (results) {
        results.classList.add('active');
        setTimeout(() => {
            results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

/**
 * Hide results section
 */
function hideResults() {
    const results = document.getElementById('results');
    if (results) results.classList.remove('active');
}

/**
 * Set fetch button loading state
 * @param {boolean} loading - Is loading
 */
function setFetchBtnLoading(loading) {
    const btn = document.getElementById('fetchBtn');
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Fetching...`;
    } else {
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
        }
    }
}

/**
 * Format file size
 * @param {number|string} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
function formatSize(bytes) {
    if (!bytes || bytes === 0) return '';
    const num = parseInt(bytes);
    if (isNaN(num)) return bytes.toString();
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Format number (views, likes etc)
 * @param {number|string} num
 * @returns {string}
 */
function formatNumber(num) {
    if (!num) return '';
    const n = parseInt(num);
    if (isNaN(n)) return num.toString();
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Switch between download tabs (video/audio)
 * @param {string} tab - Tab name ('video' or 'audio')
 * @param {HTMLElement} el - Clicked tab element
 */
function switchTab(tab, el) {
    document.querySelectorAll('.download-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    const panel = document.getElementById(tab + 'Tab');
    if (panel) panel.classList.add('active');
}

/**
 * Toggle mobile navigation
 */
function toggleNav() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('active');
}

/**
 * Build quality badge HTML
 * @param {string} quality - Quality string
 * @returns {{cls: string, label: string}}
 */
function getQualityInfo(quality) {
    const q = quality.toString().toLowerCase().replace(/\s/g, '');
    const map = {
        '2k': { cls: 'qhd', label: '2K (1440p)' },
        '1440p': { cls: 'qhd', label: '2K (1440p)' },
        '1440': { cls: 'qhd', label: '2K (1440p)' },
        '4k': { cls: 'qhd', label: '4K (2160p)' },
        '2160p': { cls: 'qhd', label: '4K (2160p)' },
        '1080p': { cls: 'fhd', label: '1080p Full HD' },
        '1080': { cls: 'fhd', label: '1080p Full HD' },
        '720p': { cls: 'hd', label: '720p HD' },
        '720': { cls: 'hd', label: '720p HD' },
        '480p': { cls: 'sd', label: '480p SD' },
        '480': { cls: 'sd', label: '480p SD' },
        '360p': { cls: 'sd', label: '360p' },
        '360': { cls: 'sd', label: '360p' },
        '240p': { cls: 'sd', label: '240p' },
        '240': { cls: 'sd', label: '240p' },
        '144p': { cls: 'sd', label: '144p' },
        '144': { cls: 'sd', label: '144p' },
        'hd': { cls: 'fhd', label: 'High Definition' },
        'sd': { cls: 'sd', label: 'Standard Definition' },
        'fhd': { cls: 'fhd', label: 'Full HD' },
    };
    return map[q] || { cls: 'sd', label: quality || 'Unknown' };
}

// ==================== YOUTUBE DOWNLOADER ====================

const YouTube = {
    platform: 'youtube',
    apiEndpoint: '/api/youtube',
    urlPattern: /youtu\.?be/i,

    /**
     * Validate YouTube URL
     */
    validate(url) {
        if (!url) return 'Please paste a YouTube URL';
        if (!isValidUrl(url)) return 'Please enter a valid URL';
        if (!this.urlPattern.test(url)) return 'Please enter a valid YouTube URL';
        return null;
    },

    /**
     * Fetch video info from server
     */
    async fetch(url) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch video');
        return result.data;
    },

    /**
     * Render results to page
     */
    render(data) {
        const title = data.title || data.name || 'YouTube Video';
        const thumb = data.thumbnail || data.thumb || data.image || '';
        const author = data.author || data.channel || data.uploader || 'Unknown';
        const duration = data.duration || '';
        const views = data.views ? formatNumber(data.views) : '';

        // Set preview
        const titleEl = document.getElementById('videoTitle');
        const thumbEl = document.getElementById('thumbnail');
        const durationEl = document.getElementById('duration');
        const authorEl = document.getElementById('videoAuthor');
        const viewsEl = document.getElementById('videoViews');

        if (titleEl) titleEl.textContent = title;
        if (thumbEl) thumbEl.src = thumb;
        if (durationEl) durationEl.textContent = duration;
        if (authorEl) authorEl.innerHTML = `<i class="fas fa-user"></i> ${author}`;
        if (viewsEl) viewsEl.innerHTML = views ? `<i class="fas fa-eye"></i> ${views}` : '';

        const videoContainer = document.getElementById('videoQualities');
        const audioContainer = document.getElementById('audioQualities');
        if (videoContainer) videoContainer.innerHTML = '';
        if (audioContainer) audioContainer.innerHTML = '';

        // Parse and render links
        const links = data.links || data.downloads || data.medias || [];

        if (Array.isArray(links) && links.length > 0) {
            links.forEach(link => {
                const quality = link.quality || link.resolution || link.label || '';
                const downloadUrl = link.url || link.link || link.href || '';
                const size = link.size || link.filesize || '';
                const type = link.type || link.mimeType || '';
                const ext = link.extension || link.ext || 'mp4';
                const isAudio = type.includes('audio') ||
                    ext === 'mp3' || ext === 'm4a' ||
                    quality.toLowerCase().includes('audio') ||
                    quality.toLowerCase().includes('mp3') ||
                    quality.toLowerCase().includes('m4a');

                if (!downloadUrl) return;

                const filename = `${title.substring(0, 50)}_${quality}.${isAudio ? 'mp3' : 'mp4'}`;
                const proxyUrl = createProxyUrl(downloadUrl, filename);
                const sizeStr = formatSize(size);

                if (isAudio) {
                    if (audioContainer) {
                        audioContainer.innerHTML += this.buildAudioItem(quality, ext, sizeStr, proxyUrl);
                    }
                } else {
                    if (videoContainer) {
                        const qInfo = getQualityInfo(quality);
                        videoContainer.innerHTML += this.buildVideoItem(quality, qInfo, ext, sizeStr, proxyUrl);
                    }
                }
            });
        }

        // Handle HD/SD direct format
        if (data.hd || data.HD) {
            const hdUrl = data.hd || data.HD;
            const proxyUrl = createProxyUrl(hdUrl, `${title.substring(0, 50)}_HD.mp4`);
            if (videoContainer) {
                videoContainer.innerHTML += this.buildVideoItem('1080p', getQualityInfo('1080p'), 'mp4', '', proxyUrl);
            }
        }
        if (data.sd || data.SD) {
            const sdUrl = data.sd || data.SD;
            const proxyUrl = createProxyUrl(sdUrl, `${title.substring(0, 50)}_SD.mp4`);
            if (videoContainer) {
                videoContainer.innerHTML += this.buildVideoItem('360p', getQualityInfo('360p'), 'mp4', '', proxyUrl);
            }
        }

        // Single URL fallback
        const singleUrl = data.download_url || data.url_dl;
        if (typeof singleUrl === 'string' && singleUrl.startsWith('http') && videoContainer && !videoContainer.innerHTML.trim()) {
            const proxyUrl = createProxyUrl(singleUrl, `${title.substring(0, 50)}.mp4`);
            videoContainer.innerHTML = this.buildVideoItem('Best', { cls: 'hd', label: 'Best Available Quality' }, 'mp4', '', proxyUrl);
        }

        // Empty state
        if (videoContainer && !videoContainer.innerHTML.trim()) {
            videoContainer.innerHTML = this.emptyState('No video downloads found');
        }
        if (audioContainer && !audioContainer.innerHTML.trim()) {
            audioContainer.innerHTML = this.emptyState('No audio downloads found');
        }

        showResults();
    },

    buildVideoItem(quality, qInfo, ext, size, proxyUrl) {
        return `
            <div class="quality-item fade-in">
                <div class="quality-info">
                    <span class="quality-badge ${qInfo.cls}">${quality || 'MP4'}</span>
                    <div class="quality-details">
                        <span class="quality-label">${qInfo.label}</span>
                        <span class="quality-size">${size ? size + ' • ' : ''}${ext.toUpperCase()}</span>
                    </div>
                </div>
                <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>`;
    },

    buildAudioItem(quality, ext, size, proxyUrl) {
        return `
            <div class="audio-item fade-in">
                <div class="audio-info">
                    <div class="audio-icon"><i class="fas fa-music"></i></div>
                    <div class="quality-details">
                        <span class="quality-label">${quality || 'Audio'} — ${ext.toUpperCase()}</span>
                        <span class="quality-size">${size || 'MP3 Audio'}</span>
                    </div>
                </div>
                <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>`;
    },

    emptyState(msg) {
        return `<p style="color:var(--text-muted);text-align:center;padding:30px 20px;">
                    <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                    ${msg}
                </p>`;
    },

    /**
     * Main entry point
     */
    async download() {
        const input = document.getElementById('urlInput');
        if (!input) return;
        const url = input.value.trim();

        const error = this.validate(url);
        if (error) { showError(error); return; }

        hideError();
        hideResults();
        showLoader('Fetching YouTube video details...');
        setFetchBtnLoading(true);

        try {
            const data = await this.fetch(url);
            this.render(data);
        } catch (err) {
            showError(err.message || 'Failed to fetch video. Please try again.');
        } finally {
            hideLoader();
            setFetchBtnLoading(false);
        }
    }
};

// ==================== FACEBOOK DOWNLOADER ====================

const Facebook = {
    platform: 'facebook',
    apiEndpoint: '/api/facebook',
    urlPattern: /facebook\.com|fb\.watch|fb\.com/i,

    validate(url) {
        if (!url) return 'Please paste a Facebook URL';
        if (!isValidUrl(url)) return 'Please enter a valid URL';
        if (!this.urlPattern.test(url)) return 'Please enter a valid Facebook URL';
        return null;
    },

    async fetch(url) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch video');
        return result.data;
    },

    render(data) {
        const title = data.title || data.name || 'Facebook Video';
        const thumb = data.thumbnail || data.thumb || data.image || '';
        const author = data.author || data.source || data.page || 'Facebook';

        const titleEl = document.getElementById('videoTitle');
        const thumbEl = document.getElementById('thumbnail');
        const authorEl = document.getElementById('videoAuthor');

        if (titleEl) titleEl.textContent = title;
        if (thumbEl) thumbEl.src = thumb;
        if (authorEl) authorEl.innerHTML = `<i class="fas fa-user"></i> ${author}`;

        const videoContainer = document.getElementById('videoQualities');
        const audioContainer = document.getElementById('audioQualities');
        if (videoContainer) videoContainer.innerHTML = '';
        if (audioContainer) audioContainer.innerHTML = '';

        // HD/SD direct
        const hdUrl = data.hd || data.HD || data.high;
        const sdUrl = data.sd || data.SD || data.low || data.normal;

        if (hdUrl && videoContainer) {
            const proxyUrl = createProxyUrl(hdUrl, `${title.substring(0, 50)}_HD.mp4`);
            videoContainer.innerHTML += `
                <div class="quality-item fade-in">
                    <div class="quality-info">
                        <span class="quality-badge fhd">HD</span>
                        <div class="quality-details">
                            <span class="quality-label">HD Quality (720p / 1080p)</span>
                            <span class="quality-size">MP4 • Best Quality</span>
                        </div>
                    </div>
                    <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                        <i class="fas fa-download"></i> Download HD
                    </a>
                </div>`;
        }

        if (sdUrl && videoContainer) {
            const proxyUrl = createProxyUrl(sdUrl, `${title.substring(0, 50)}_SD.mp4`);
            videoContainer.innerHTML += `
                <div class="quality-item fade-in">
                    <div class="quality-info">
                        <span class="quality-badge sd">SD</span>
                        <div class="quality-details">
                            <span class="quality-label">SD Quality (360p / 480p)</span>
                            <span class="quality-size">MP4 • Smaller Size</span>
                        </div>
                    </div>
                    <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                        <i class="fas fa-download"></i> Download SD
                    </a>
                </div>`;
        }

        // Array links
        const links = data.links || data.downloads || data.medias || [];
        if (Array.isArray(links)) {
            links.forEach(link => {
                const q = link.quality || link.resolution || 'Video';
                const dUrl = link.url || link.link || '';
                const size = formatSize(link.size || '');
                const type = link.type || '';
                const isAudio = type.includes('audio');

                if (!dUrl) return;

                const ext = isAudio ? 'mp3' : 'mp4';
                const filename = `${title.substring(0, 50)}_${q}.${ext}`;
                const proxyUrl = createProxyUrl(dUrl, filename);
                const isHD = q.toString().toLowerCase().includes('hd') ||
                    q.includes('1080') || q.includes('720');

                if (isAudio && audioContainer) {
                    audioContainer.innerHTML += `
                        <div class="audio-item fade-in">
                            <div class="audio-info">
                                <div class="audio-icon" style="background:var(--facebook-glow);color:var(--facebook-primary)">
                                    <i class="fas fa-music"></i>
                                </div>
                                <div class="quality-details">
                                    <span class="quality-label">${q} Audio</span>
                                    <span class="quality-size">${size || 'MP3'}</span>
                                </div>
                            </div>
                            <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>`;
                } else if (!isAudio && videoContainer) {
                    videoContainer.innerHTML += `
                        <div class="quality-item fade-in">
                            <div class="quality-info">
                                <span class="quality-badge ${isHD ? 'fhd' : 'sd'}">${q}</span>
                                <div class="quality-details">
                                    <span class="quality-label">${q} Quality</span>
                                    <span class="quality-size">${size ? size + ' • ' : ''}MP4</span>
                                </div>
                            </div>
                            <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>`;
                }
            });
        }

        // Empty states
        if (videoContainer && !videoContainer.innerHTML.trim()) {
            videoContainer.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:30px;">
                <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                No video downloads found
            </p>`;
        }
        if (audioContainer && !audioContainer.innerHTML.trim()) {
            audioContainer.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:30px;">
                <i class="fas fa-music" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                No audio available for this video
            </p>`;
        }

        showResults();
    },

    async download() {
        const input = document.getElementById('urlInput');
        if (!input) return;
        const url = input.value.trim();

        const error = this.validate(url);
        if (error) { showError(error); return; }

        hideError();
        hideResults();
        showLoader('Fetching Facebook video...');
        setFetchBtnLoading(true);

        try {
            const data = await this.fetch(url);
            this.render(data);
        } catch (err) {
            showError(err.message || 'Failed to fetch video. Please try again.');
        } finally {
            hideLoader();
            setFetchBtnLoading(false);
        }
    }
};

// ==================== INSTAGRAM DOWNLOADER ====================

const Instagram = {
    platform: 'instagram',
    apiEndpoint: '/api/instagram',
    urlPattern: /instagram\.com|instagr\.am/i,

    validate(url) {
        if (!url) return 'Please paste an Instagram URL';
        if (!isValidUrl(url)) return 'Please enter a valid URL';
        if (!this.urlPattern.test(url)) return 'Please enter a valid Instagram URL';
        return null;
    },

    async fetch(url) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch content');
        return result.data;
    },

    render(data) {
        const title = data.title || data.caption || 'Instagram Content';
        const thumb = data.thumbnail || data.thumb || data.image || '';
        const author = data.author || data.username || data.owner || 'Instagram User';

        const titleEl = document.getElementById('videoTitle');
        const thumbEl = document.getElementById('thumbnail');
        const authorEl = document.getElementById('videoAuthor');

        if (titleEl) titleEl.textContent = title.substring(0, 100);
        if (thumbEl) thumbEl.src = thumb;
        if (authorEl) authorEl.innerHTML = `<i class="fas fa-user"></i> @${author}`;

        const container = document.getElementById('downloadLinks');
        if (container) container.innerHTML = '';

        // Array links
        const links = data.links || data.downloads || data.medias || data.media || [];

        if (Array.isArray(links) && links.length > 0) {
            links.forEach((link, i) => {
                const dUrl = link.url || link.link || link.href || (typeof link === 'string' ? link : '');
                if (!dUrl || !dUrl.startsWith('http')) return;

                const type = link.type || '';
                const quality = link.quality || '';
                const isVideo = type.includes('video') || dUrl.includes('.mp4') || !type.includes('image');
                const ext = isVideo ? 'mp4' : 'jpg';
                const filename = `instagram_${i + 1}.${ext}`;
                const proxyUrl = createProxyUrl(dUrl, filename);

                if (container) {
                    container.innerHTML += `
                        <div class="quality-item fade-in">
                            <div class="quality-info">
                                <span class="quality-badge ${isVideo ? 'fhd' : 'hd'}">
                                    ${isVideo ? 'Video' : 'Photo'}
                                </span>
                                <div class="quality-details">
                                    <span class="quality-label">
                                        ${isVideo ? 'Video' : 'Image'} ${links.length > 1 ? i + 1 : ''}
                                        ${quality ? '• ' + quality : ''}
                                    </span>
                                    <span class="quality-size">${ext.toUpperCase()}</span>
                                </div>
                            </div>
                            <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>`;
                }
            });
        }

        // Single URL fallback
        const singleUrl = data.download_url || data.url_dl || data.video || data.url;
        if (typeof singleUrl === 'string' && singleUrl.startsWith('http') && container && !container.innerHTML.trim()) {
            const proxyUrl = createProxyUrl(singleUrl, 'instagram_download.mp4');
            container.innerHTML = `
                <div class="quality-item fade-in">
                    <div class="quality-info">
                        <span class="quality-badge fhd">HD</span>
                        <div class="quality-details">
                            <span class="quality-label">Best Available Quality</span>
                            <span class="quality-size">MP4</span>
                        </div>
                    </div>
                    <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>`;
        }

        // Empty state
        if (container && !container.innerHTML.trim()) {
            container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:30px;">
                <i class="fas fa-lock" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                No downloads found. The content may be private or unavailable.
            </p>`;
        }

        showResults();
    },

    async download() {
        const input = document.getElementById('urlInput');
        if (!input) return;
        const url = input.value.trim();

        const error = this.validate(url);
        if (error) { showError(error); return; }

        hideError();
        hideResults();
        showLoader('Fetching Instagram content...');
        setFetchBtnLoading(true);

        try {
            const data = await this.fetch(url);
            this.render(data);
        } catch (err) {
            showError(err.message || 'Failed to fetch content. Please try again.');
        } finally {
            hideLoader();
            setFetchBtnLoading(false);
        }
    }
};

// ==================== TIKTOK DOWNLOADER ====================

const TikTok = {
    platform: 'tiktok',
    apiEndpoint: '/api/tiktok',
    urlPattern: /tiktok\.com|vm\.tiktok/i,

    validate(url) {
        if (!url) return 'Please paste a TikTok URL';
        if (!isValidUrl(url)) return 'Please enter a valid URL';
        if (!this.urlPattern.test(url)) return 'Please enter a valid TikTok URL';
        return null;
    },

    async fetch(url) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch video');
        return result.data;
    },

    render(data) {
        const title = data.title || data.desc || data.description || 'TikTok Video';
        const thumb = data.thumbnail || data.cover || data.thumb || data.image || '';
        const author = data.author || data.username || data.creator || 'TikTok User';
        const likes = data.likes || data.digg_count || '';
        const plays = data.plays || data.play_count || '';
        const comments = data.comments || data.comment_count || '';

        const titleEl = document.getElementById('videoTitle');
        const thumbEl = document.getElementById('thumbnail');
        const authorEl = document.getElementById('videoAuthor');
        const statsEl = document.getElementById('videoStats');

        if (titleEl) titleEl.textContent = title.substring(0, 120);
        if (thumbEl) thumbEl.src = thumb;
        if (authorEl) authorEl.innerHTML = `<i class="fab fa-tiktok"></i> @${author}`;

        if (statsEl) {
            let statsHtml = '';
            if (plays) statsHtml += `<i class="fas fa-play"></i> ${formatNumber(plays)} `;
            if (likes) statsHtml += `<i class="fas fa-heart"></i> ${formatNumber(likes)} `;
            if (comments) statsHtml += `<i class="fas fa-comment"></i> ${formatNumber(comments)}`;
            statsEl.innerHTML = statsHtml;
        }

        const container = document.getElementById('downloadCards');
        if (container) container.innerHTML = '';

        // No Watermark Video
        const noWm = data.no_watermark || data.nowm || data.video_no_watermark || data.play || '';
        const hdNoWm = data.hdplay || data.hd || data.video_hd || '';
        const withWm = data.watermark || data.wm || data.video_watermark || data.wmplay || '';
        const audioUrl = data.audio || data.music || data.music_url || data.audio_url || '';

        if (hdNoWm && container) {
            const proxyUrl = createProxyUrl(hdNoWm, 'tiktok_HD_no_watermark.mp4');
            container.innerHTML += this.buildCard(
                'video-icon', 'fas fa-film',
                'HD Video — No Watermark',
                'Full HD • No TikTok Logo • Best Quality',
                proxyUrl, 'Download HD'
            );
        }

        if (noWm && noWm !== hdNoWm && container) {
            const proxyUrl = createProxyUrl(noWm, 'tiktok_no_watermark.mp4');
            container.innerHTML += this.buildCard(
                'video-icon', 'fas fa-video',
                'Video Without Watermark',
                'HD Quality • Clean Video • MP4',
                proxyUrl, 'Download'
            );
        }

        if (audioUrl && container) {
            const proxyUrl = createProxyUrl(audioUrl, 'tiktok_audio.mp3');
            container.innerHTML += this.buildCard(
                'audio-icon-tt', 'fas fa-music',
                'Audio Only',
                'Extract background music / sound • MP3',
                proxyUrl, 'Download Audio'
            );
        }

        if (withWm && !noWm && !hdNoWm && container) {
            const proxyUrl = createProxyUrl(withWm, 'tiktok_video.mp4');
            container.innerHTML += this.buildCard(
                'video-icon', 'fas fa-video',
                'Video (Original)',
                'Original TikTok Video • MP4',
                proxyUrl, 'Download'
            );
        }

        // Array links fallback
        const links = data.links || data.downloads || data.medias || [];
        if (Array.isArray(links)) {
            links.forEach((link, i) => {
                const dUrl = link.url || link.link || '';
                const label = link.quality || link.label || `Option ${i + 1}`;
                const isAudio = (link.type || '').includes('audio');
                if (!dUrl) return;

                const ext = isAudio ? 'mp3' : 'mp4';
                const proxyUrl = createProxyUrl(dUrl, `tiktok_${label}.${ext}`);

                if (container) {
                    container.innerHTML += this.buildCard(
                        isAudio ? 'audio-icon-tt' : 'video-icon',
                        `fas fa-${isAudio ? 'music' : 'video'}`,
                        label,
                        `${isAudio ? 'Audio' : 'Video'} • ${ext.toUpperCase()}`,
                        proxyUrl, 'Download'
                    );
                }
            });
        }

        // Single URL fallback
        const singleUrl = data.download_url || data.url_dl || data.video;
        if (typeof singleUrl === 'string' && singleUrl.startsWith('http') &&
            container && !container.innerHTML.trim()) {
            const proxyUrl = createProxyUrl(singleUrl, 'tiktok_video.mp4');
            container.innerHTML += this.buildCard(
                'video-icon', 'fas fa-video',
                'Download Video',
                'MP4 Format',
                proxyUrl, 'Download'
            );
        }

        // Empty state
        if (container && !container.innerHTML.trim()) {
            container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:40px;">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                No downloads found. The video may be private or unavailable.
            </p>`;
        }

        showResults();
    },

    buildCard(iconCls, iconFa, title, subtitle, proxyUrl, btnLabel) {
        return `
            <div class="tiktok-download-card fade-in">
                <div class="tiktok-card-info">
                    <div class="tiktok-card-icon ${iconCls}">
                        <i class="${iconFa}"></i>
                    </div>
                    <div class="tiktok-card-text">
                        <h4>${title}</h4>
                        <p>${subtitle}</p>
                    </div>
                </div>
                <a href="${proxyUrl}" class="download-btn" target="_blank" rel="noopener">
                    <i class="fas fa-download"></i> ${btnLabel}
                </a>
            </div>`;
    },

    async download() {
        const input = document.getElementById('urlInput');
        if (!input) return;
        const url = input.value.trim();

        const error = this.validate(url);
        if (error) { showError(error); return; }

        hideError();
        hideResults();
        showLoader('Removing watermark & fetching video...');
        setFetchBtnLoading(true);

        try {
            const data = await this.fetch(url);
            this.render(data);
        } catch (err) {
            showError(err.message || 'Failed to fetch video. Please try again.');
        } finally {
            hideLoader();
            setFetchBtnLoading(false);
        }
    }
};

// ==================== GLOBAL INIT ====================

/**
 * Detect current page and set up the right downloader
 */
function initPage() {
    const path = window.location.pathname;

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
    });

    // Close mobile nav on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('navLinks');
            if (nav) nav.classList.remove('active');
        });
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.platform-card, .feature-card, .creator-card').forEach(el => {
        observer.observe(el);
    });

    // Setup Enter key listener for URL input
    const urlInput = document.getElementById('urlInput');
    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Trigger the right downloader
                if (path.includes('youtube')) YouTube.download();
                else if (path.includes('facebook')) Facebook.download();
                else if (path.includes('instagram')) Instagram.download();
                else if (path.includes('tiktok')) TikTok.download();
            }
        });

        // Paste event — auto-fetch on paste
        urlInput.addEventListener('paste', () => {
            setTimeout(() => {
                const val = urlInput.value.trim();
                if (val && isValidUrl(val)) {
                    if (path.includes('youtube')) YouTube.download();
                    else if (path.includes('facebook')) Facebook.download();
                    else if (path.includes('instagram')) Instagram.download();
                    else if (path.includes('tiktok')) TikTok.download();
                }
            }, 100);
        });
    }

    // Expose global fetch functions used by onclick attributes in HTML
    window.fetchVideo = () => {
        if (path.includes('youtube')) YouTube.download();
        else if (path.includes('facebook')) Facebook.download();
        else if (path.includes('instagram')) Instagram.download();
        else if (path.includes('tiktok')) TikTok.download();
    };

    window.switchTab = switchTab;
    window.toggleNav = toggleNav;

    console.log(`✅ SaveGrab by Dark Forid — Page: ${path || 'home'}`);
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initPage);
