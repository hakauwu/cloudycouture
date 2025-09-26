class SidebarPostsLoader {
    constructor() {
        this.allPosts = [];
        this.currentPostTitle = "What to wear in cloudy day?";
        this.initializeLoader();
    }

    async initializeLoader() {
        try {
            await this.loadPosts();
            this.displayRandomPosts();
        } catch (error) {
            console.error('Error loading sidebar posts:', error);
            this.showErrorMessage();
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('../data/posts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.allPosts = await response.json();
            console.log('Posts loaded for sidebar:', this.allPosts.length);
        } catch (error) {
            console.error('Error fetching posts.json:', error);
            throw error;
        }
    }

    displayRandomPosts() {
        const otherPosts = this.allPosts.filter(post => 
            post.title !== this.currentPostTitle
        );

        if (otherPosts.length === 0) {
            this.showNoPostsMessage();
            return;
        }

        const randomPosts = this.getRandomPosts(otherPosts, 1);
        
        const sidebarContainer = document.querySelector('.main-sidebar .new-posts');
        if (!sidebarContainer) {
            console.error('Sidebar container not found');
            return;
        }

        const existingCards = sidebarContainer.querySelectorAll('.card2');
        existingCards.forEach(card => card.remove());

        randomPosts.forEach(post => {
            const postCard = this.createPostCard(post);
            sidebarContainer.appendChild(postCard);
        });
    }

    getRandomPosts(posts, count) {
        const shuffled = [...posts];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    createPostCard(post) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card2';
        cardElement.style.cursor = 'pointer';
        cardElement.style.marginBottom = '20px';
        cardElement.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

        const truncatedBody = this.truncateText(post.body, 120);

        cardElement.innerHTML = `
            <div class="card2-image" style="
                background-image: url('${post.image}'); 
                background-size: cover; 
                background-position: center;
                height: 150px;
                border-radius: 8px 8px 0 0;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    height: 50px;
                "></div>
            </div>
            <div style="padding: 15px;">
                <p class="card2-title" style="
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 8px;
                    line-height: 1.3;
                    color: #333;
                ">${post.title}</p>
                <p class="card2-body" style="
                    color: #666;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    margin-bottom: 12px;
                ">${truncatedBody}</p>
                <p class="card-footer" style="
                    font-size: 0.8rem;
                    color: #888;
                    margin: 0;
                    padding-top: 8px;
                    border-top: 1px solid #eee;
                ">
                    Written by <span class="by-name" style="color: teal; font-weight: 500;">${post.username}</span>
                    ${post.date !== 'None' ? `on <span class="date">${post.date}</span>` : ''}
                </p>
            </div>
        `;

        cardElement.addEventListener('mouseenter', () => {
            cardElement.style.transform = 'translateY(-5px)';
            cardElement.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });

        cardElement.addEventListener('mouseleave', () => {
            cardElement.style.transform = 'translateY(0)';
            cardElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });

        cardElement.addEventListener('click', () => {
            this.showLoadingState(cardElement);
            
            setTimeout(() => {
                window.location.href = post.link;
            }, 500);
        });

        return cardElement;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        const truncated = text.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > 0) {
            return truncated.substring(0, lastSpace) + '...';
        }
        
        return truncated + '...';
    }

    showLoadingState(cardElement) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 8px;
            z-index: 10;
        `;
        
        loadingOverlay.innerHTML = `
            <div style="
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid teal;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
        `;

        if (!document.querySelector('#spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        cardElement.style.position = 'relative';
        cardElement.appendChild(loadingOverlay);
    }

    showErrorMessage() {
        const sidebarContainer = document.querySelector('.main-sidebar .new-posts');
        if (!sidebarContainer) return;

        const errorCard = document.createElement('div');
        errorCard.className = 'card2';
        errorCard.style.cssText = `
            padding: 20px;
            text-align: center;
            border: 2px dashed #ddd;
            background: #f8f9fa;
        `;

        errorCard.innerHTML = `
            <p style="color: #666; margin: 0;">
                <strong>Oops!</strong><br>
                Unable to load similar posts.<br>
                <small>Please refresh the page to try again.</small>
            </p>
        `;

        sidebarContainer.appendChild(errorCard);
    }

    showNoPostsMessage() {
        const sidebarContainer = document.querySelector('.main-sidebar .new-posts');
        if (!sidebarContainer) return;

        const noPostsCard = document.createElement('div');
        noPostsCard.className = 'card2';
        noPostsCard.style.cssText = `
            padding: 20px;
            text-align: center;
            background: #f8f9fa;
        `;

        noPostsCard.innerHTML = `
            <p style="color: #666; margin: 0;">
                <strong>No similar posts found</strong><br>
                <small>Check back later for more content!</small>
            </p>
        `;

        sidebarContainer.appendChild(noPostsCard);
    }

    async refresh() {
        try {
            await this.loadPosts();
            this.displayRandomPosts();
        } catch (error) {
            console.error('Error refreshing sidebar posts:', error);
        }
    }

    setCurrentPost(title) {
        this.currentPostTitle = title;
        this.displayRandomPosts();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebarLoader = new SidebarPostsLoader();
});

export default SidebarPostsLoader;