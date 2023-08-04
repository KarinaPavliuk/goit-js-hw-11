import axios from 'axios';
axios.defaults.headers.common['x-api-key'] =
  '38592698-fb670dc072756c252ce931a2b';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const search = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
let searchWords;
let currentPage = 1;

loadBtn.style.display = 'none';

search.addEventListener('submit', onSearch);
loadBtn.addEventListener('click', onLoadClick);

function onSearch(evt) {
  evt.preventDefault();
  loadBtn.style.display = 'none';

  const { searchQuery } = evt.currentTarget.elements;
  searchWords = searchQuery.value.split(' ').join('+');
  console.log('searchWords', searchWords);

  getImages(searchWords)
    .then(data => {
      console.log('data.hits', data.hits);

      if (data.hits.length) {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
      } else {
        Notify.failure('Oops! Something went wrong! Try reloading the page!');
      }

      gallery.innerHTML = createMarkup(data.hits);

      const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });

      loadBtn.style.display = 'block';
    })
    .catch(err => console.log(err));
}

function onLoadClick() {
  currentPage += 1;

  getImages(searchWords)
    .then(data => {
      console.log('data.hits', data.hits);

      gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));

      const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });

      loadBtn.style.display = 'block';
    })
    .catch(err => console.log(err));
}

function getImages(searchWords) {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '38592698-fb670dc072756c252ce931a2b';

  return fetch(
    `${BASE_URL}?key=${KEY}&q=${searchWords}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`
  ).then(resp => {
    console.log(resp);
    if (!resp.ok) {
      throw new Error(resp.statusText);
    }
    return resp.json();
  });
}

function createMarkup(arr) {
  console.log('arr', arr);
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
            <a href="${largeImageURL}" class="photo-link"><img src="${webformatURL}" alt="${tags}" loading="lazy" class="photo-img"/></a>
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                <span>${likes}</span>
              </p>
              <p class="info-item">
                <b>Views</b>
                <span>${views}</span>
              </p>
              <p class="info-item">
                <b>Comments</b>
                <span>${comments}</span>
              </p>
              <p class="info-item">
                <b>Downloads</b>
                <span>${downloads}</span>
              </p>
            </div>
        </div>`;
      }
    )
    .join('');
}
