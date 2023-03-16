import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

let gallery = new SimpleLightbox('.gallery a');

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '34470950-02ddf263054359fc18b5be4c8';

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector('input[name="searchQuery"]');
const galleryEl = document.querySelector('.gallery');
const buttonLoadMoreEl = document.querySelector('.load-more');
const alertEl = document.querySelector('.text');

let page = 1;
let keyValue = '';
let totalPages = 0;

function onFormSubmit(event) {
  event.preventDefault();
  keyValue = inputEl.value;

  page = 1;
  galleryEl.innerHTML = '';
  alertEl.classList.add('hidden');

  if (!keyValue.trim()) {
    Notiflix.Notify.info('Oops! Please, enter smth to search.');
    buttonLoadMoreEl.classList.add('hidden');
    return;
  }

  getImg(keyValue);
  event.currentTarget.reset();
}

function onButtonLoadMoreClick() {
  getImg(keyValue);
}

async function getImg(keyWord) {
  try {
    const response = await axios.get(
      `${BASE_URL}/?key=${KEY}&q=${keyWord}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );

    if (response.data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      buttonLoadMoreEl.classList.add('hidden');
      alertEl.classList.add('hidden');
      return;
    }
    if (page === 1) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }

    buttonLoadMoreEl.classList.remove('hidden');
    totalPages = Math.ceil(response.data.totalHits / 40);

    renderGallery(response.data.hits);
    page += 1;

    if (page > totalPages) {
      Notiflix.Notify.info(
        ` We're sorry, but you've reached the end of search results.`
      );
      buttonLoadMoreEl.classList.add('hidden');
    }
  } catch (error) {
    console.error(error);
  }
}

function renderGallery(images) {
  const markup = images
    .map(image => {
      return ` 
          <div class="photo-card">
              <a href="${image.largeImageURL}">
                  <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
              </a>
              <div class="info">
              <p class="info-item">
              <b>Likes</b>
              ${image.likes}
              </p>
              <p class="info-item">
              <b>Views</b>
              ${image.views}
              </p>
              <p class="info-item">
              <b>Comments</b>
              ${image.comments}
              </p>
              <p class="info-item">
              <b>Downloads</b>
              ${image.downloads}
              </p>
              </div>
          </div>
          `;
    })
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);

  if (page > 1) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }

  gallery.refresh();
}

function toogleTextMarkup() {
  inputEl.classList.remove('hidden');
  buttonLoadMoreEl.classList.add('hidden');
}

formEl.addEventListener('submit', onFormSubmit);
buttonLoadMoreEl.addEventListener('click', onButtonLoadMoreClick);
