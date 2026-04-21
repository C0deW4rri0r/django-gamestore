//modal window
const modal = document.getElementById('game-modal');
const quickViewButtons = document.querySelectorAll('.quick-view-btn');
const closeModalButton = document.getElementById('modal-close-btn');
const modalOverlay = document.querySelector('.modal-overlay');

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

        flyingImage.style.left = `${sourceRect.left}px`;
        flyingImage.style.top = `${sourceRect.top}px`;
        flyingImage.style.width = `${sourceRect.width}px`;
        flyingImage.style.height = `${sourceRect.height}px`;
        flyingImage.style.opacity = '1';
        flyingImage.style.transform = 'translate(0, 0) scale(1)';

        document.body.appendChild(flyingImage);

        const translateX =
            targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
        const translateY =
            targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

        flyingImage.getBoundingClientRect();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                flyingImage.style.transform =
                    `translate(${translateX}px, ${translateY}px) scale(0.35)`;
                flyingImage.style.opacity = '0.85';
            });
        });

        setTimeout(() => {
            flyingImage.remove();
            resolve();
        }, 700);
    });
}
