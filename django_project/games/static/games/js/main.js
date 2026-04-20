const modal = document.getElementById('game-modal');
const quickViewButtons = document.querySelectorAll('.quick-view-btn');
const closeModalButton = document.getElementById('modal-close-btn');
const modalOverlay = document.querySelector('.modal-overlay');

quickViewButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const gameId = button.dataset.gameId;

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
});

closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
});

modalOverlay.addEventListener('click', () => {
    modal.classList.add('hidden');
});

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
