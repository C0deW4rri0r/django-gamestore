//modal window
const modal = document.getElementById('game-modal');
const quickViewButtons = document.querySelectorAll('.quick-view-btn');
const closeModalButton = document.getElementById('modal-close-btn');
const modalOverlay = document.querySelector('.modal-overlay');
const modalGameDetailLink = document.getElementById('modal-game-detail-link');

document.addEventListener('click', async (event) => {
    const quickViewButton = event.target.closest('.quick-view-btn');

    if (!quickViewButton) return;

    const gameId = quickViewButton.dataset.gameId;

    try {
        const response = await fetch(`/games/${gameId}/modal-data/`);

        if (!response.ok) {
            throw new Error('Не удалось загрузить данные игры');
        }

        const data = await response.json();
        fillModal(data);
        modal.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        alert('Не удалось открыть модальное окно. Попробуйте ещё раз.');
    }
});

if (closeModalButton && modal) {
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

if (modalOverlay && modal) {
    modalOverlay.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

const modalGameImage = document.getElementById('modal-game-image');
const modalGameName = document.getElementById('modal-game-name');
const modalGameDeveloper = document.getElementById('modal-game-developer');
const modalGameReleaseDate = document.getElementById('modal-game-release-date');
const modalGameGenres = document.getElementById('modal-game-genres');
const modalGamePrice = document.getElementById('modal-game-price');
const modalGameDescription = document.getElementById('modal-game-description');

function fillModal(data) {
    modalGameName.textContent = data.name;
    modalGameDeveloper.textContent = data.developer || 'Не указан';
    modalGameReleaseDate.textContent = data.release_date || 'Не указана';
    modalGameGenres.textContent = data.genres.length ? data.genres.join(', ') : 'Не указаны';
    modalGamePrice.textContent = data.price;
    modalGameDescription.textContent = data.description || 'Описание отсутствует';

    if (data.image_url) {
        modalGameImage.src = data.image_url;
        modalGameImage.alt = data.name;
        modalGameImage.style.display = 'block';
    } else {
        modalGameImage.src = '';
        modalGameImage.alt = '';
        modalGameImage.style.display = 'none';
    }
    
    if (modalGameDetailLink) {
        modalGameDetailLink.href = data.detail_url;
    }
}

//filtration
const searchInput = document.getElementById('search-input');
const genreFilter = document.getElementById('genre-filter');
const loadingIndicator = document.getElementById('loading-indicator');
const gamesListContainer = document.getElementById('games-list-container');

async function loadFilteredGames() {
    if (!gamesListContainer) return;

    const filterUrl = gamesListContainer.dataset.filterUrl;
    const searchValue = searchInput ? searchInput.value.trim() : '';
    const genreValue = genreFilter ? genreFilter.value : '';

    const params = new URLSearchParams();

    if (searchValue) {
        params.append('search', searchValue);
    }

    if (genreValue) {
        params.append('genre', genreValue);
    }

    loadingIndicator.classList.remove('hidden');

    try {
        const response = await fetch(`${filterUrl}?${params.toString()}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось загрузить список игр');
        }

        const html = await response.text();
        gamesListContainer.innerHTML = html;

        initTiltCards();
    
    } catch (error) {
        console.error(error);
        gamesListContainer.innerHTML = '<p>Произошла ошибка при загрузке игр.</p>';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

let searchTimeout;

if (searchInput) {
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            loadFilteredGames();
        }, 300);
    });
}

if (genreFilter) {
    genreFilter.addEventListener('change', () => {
        loadFilteredGames();
    });
}

//cart animation
const addToCartForms = document.querySelectorAll('.add-to-cart-form');
const cartCounter = document.getElementById('cart-counter');

function pulseCartCounter() {
    if (!cartCounter) return;

    cartCounter.classList.remove('cart-counter-pulse');

    void cartCounter.offsetWidth;

    cartCounter.classList.add('cart-counter-pulse');
}

addToCartForms.forEach(form => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const actionUrl = form.action;

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Не удалось добавить игру в корзину');
            }

            const data = await response.json();

            if (data.success) {
                const sourceElement =
                    document.querySelector('.game-detail-image') ||
                    form.querySelector('.add-to-cart-btn');

                await animateFlyToCart(sourceElement);

                if (cartCounter) {
                    cartCounter.textContent = data.cart_items_count;
                }

                pulseCartCounter();
            }
        } catch (error) {
            console.error(error);
            alert('Произошла ошибка при добавлении игры в корзину.');
        }
    });
});

//flying image
const cartLink = document.getElementById('cart-link');

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function getQuadraticBezierPoint(p0, p1, p2, t) {
    const x =
        Math.pow(1 - t, 2) * p0.x +
        2 * (1 - t) * t * p1.x +
        Math.pow(t, 2) * p2.x;

    const y =
        Math.pow(1 - t, 2) * p0.y +
        2 * (1 - t) * t * p1.y +
        Math.pow(t, 2) * p2.y;

    return { x, y };
}

function animateFlyToCart(sourceElement) {
    return new Promise((resolve) => {
        if (!sourceElement || !cartLink) {
            resolve();
            return;
        }

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = cartLink.getBoundingClientRect();

        const flyingImage = sourceElement.cloneNode(true);
        flyingImage.classList.add('flying-image');

        const maxCloneWidth = 180;
        const scaleRatio = Math.min(1, maxCloneWidth / sourceRect.width);

        const startWidth = sourceRect.width * scaleRatio;
        const startHeight = sourceRect.height * scaleRatio;

        const unclampedStartX = sourceRect.left + (sourceRect.width - startWidth) / 2;
        const unclampedStartY = sourceRect.top + (sourceRect.height - startHeight) / 2;

        const startX = Math.min(
            window.innerWidth - startWidth - 16,
            Math.max(16, unclampedStartX)
        );

        const startY = Math.min(
            window.innerHeight - startHeight - 16,
            Math.max(16, unclampedStartY)
        );

        const endX = targetRect.left - startWidth * 0.3;
        const endY = targetRect.top - startHeight * 0.45;

        flyingImage.style.width = `${startWidth}px`;
        flyingImage.style.height = `${startHeight}px`;
        flyingImage.style.left = `${startX}px`;
        flyingImage.style.top = `${startY}px`;
        flyingImage.style.opacity = '1';
        flyingImage.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';

        document.body.appendChild(flyingImage);

        const p0 = { x: startX, y: startY };
        const p2 = { x: endX, y: endY };

        const arcHeight = 120
        const p1 = {
            x: lerp(startX, endX, 0.5),
            y: Math.min(startY, endY) - arcHeight
        };

        const duration = 850;
        const startTime = performance.now();

        function frame(now) {
            const elapsed = now - startTime;
            const rawT = Math.min(elapsed / duration, 1);
            const t = easeOutCubic(rawT);

            const point = getQuadraticBezierPoint(p0, p1, p2, t);

            const scale = lerp(1, 0.26, t);
            const rotate = lerp(0, 8, t);
            const opacity = lerp(1, 0.9, t);

            flyingImage.style.left = `${point.x}px`;
            flyingImage.style.top = `${point.y}px`;
            flyingImage.style.opacity = opacity;
            flyingImage.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

            if (rawT < 1) {
                requestAnimationFrame(frame);
            } else {
                flyingImage.remove();
                resolve();
            }
        }

        requestAnimationFrame(frame);
    });
}

//card tilt

const gameCards = document.querySelectorAll('.game-card');

function initTiltCards() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.game-card');

    cards.forEach(card => {
        if (card.dataset.tiltInitialized === 'true') return;

        card.dataset.tiltInitialized = 'true';

        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();

            const cardWidth = rect.width;
            const cardHeight = rect.height;

            const centerX = rect.left + cardWidth / 2;
            const centerY = rect.top + cardHeight / 2;

            const mouseX = event.clientX;
            const mouseY = event.clientY;

            const offsetX = mouseX - centerX;
            const offsetY = mouseY - centerY;

            const rotateY = (offsetX / (cardWidth / 2)) * 6;
            const rotateX = -(offsetY / (cardHeight / 2)) * 6;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            card.classList.add('tilt-active');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
            card.classList.remove('tilt-active');
        });
    });
}

initTiltCards();
