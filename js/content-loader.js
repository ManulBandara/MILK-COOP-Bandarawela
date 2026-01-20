// Load news from GitHub (where Netlify CMS saves files)
async function loadNewsContent() {
    const response = await fetch('https://api.github.com/repos/YOUR-USERNAME/YOUR-REPO/contents/content/news');
    const files = await response.json();
    
    const newsContainer = document.querySelector('.news-grid');
    
    // Sort newest first
    const sortedFiles = files.sort((a, b) => b.name.localeCompare(a.name));
    
    // Show 6 most recent
    for (const file of sortedFiles.slice(0, 6)) {
        const newsResponse = await fetch(file.download_url);
        const newsData = await newsResponse.json();
        
        const card = createNewsCard(newsData);
        newsContainer.appendChild(card);
    }
}

function createNewsCard(data) {
    const card = document.createElement('article');
    card.className = 'news-card fade-in-up';
    
    const lang = AppState.currentLanguage || 'en';
    const title = lang === 'en' ? data.title_en : data.title_si;
    const body = lang === 'en' ? data.body_en : data.body_si;
    
    card.innerHTML = `
        <div class="news-image">
            <img src="${data.image}" alt="${title}" loading="lazy">
            <span class="news-badge ${data.category}">${data.category}</span>
        </div>
        <div class="news-content">
            <time class="news-date">${new Date(data.date).toLocaleDateString()}</time>
            <h3>${title}</h3>
            <p class="news-excerpt">${body.substring(0, 150)}...</p>
            <a href="#" class="news-link">Read more →</a>
        </div>
    `;
    
    return card;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNewsContent();
    loadGalleryContent();
});
