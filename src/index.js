import { getImages } from './pixabay-api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const search = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

let searchWords;
let dataLength;
let totalLength;
let currentPage;
let lightBox;

loadBtn.style.display = 'none';

search.addEventListener('submit', onSearch);
search.addEventListener('click', onSearchClick);
loadBtn.addEventListener('click', onLoadClick);

function onSearch(evt) {
  evt.preventDefault();
  loadBtn.style.display = 'none';
  currentPage = 1;
  totalLength = 0;

  const { searchQuery } = evt.currentTarget.elements;
  searchWords = searchQuery.value.trim().split(' ').join('+');

  getImages(searchWords, currentPage)
    .then(data => {
      dataLength = data.hits.length;

      if (!searchWords) {
        gallery.innerHTML = '';
        return Notify.failure('Please enter something in the search bar.');
      } else if (!dataLength) {
        gallery.innerHTML = '';
        return Notify.failure(
          'Sorry, there are no matching your search query. Please try again'
        );
      }

      Notify.success(`Hooray! We found ${data.totalHits} images.`);
      gallery.innerHTML = createMarkup(data.hits);
      lightBox = new SimpleLightbox('.gallery a');

      loadBtn.style.display = 'block';

      totalLength += dataLength;
      if (totalLength >= data.totalHits) {
        loadBtn.style.display = 'none';
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(err => console.log(err));
}

function onSearchClick(evt) {
  evt.target.value = '';
}

function onLoadClick() {
  currentPage += 1;

  getImages(searchWords, currentPage)
    .then(data => {
      gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
      lightBox.refresh();

      loadBtn.style.display = 'block';

      totalLength += dataLength;
      if (totalLength >= data.totalHits) {
        loadBtn.style.display = 'none';
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(err => console.log(err));
}

function createMarkup(arr) {
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
