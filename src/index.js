import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const search = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
let currentPage = 1;

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

loadBtn.style.display = 'none';

search.addEventListener('submit', onSearch);

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      getImages(searchWords, currentPage)
        .then(data => {
          console.log('dataload', data);
          gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
          if (data.page !== data.total_pages) {
            observer.unobserve(target);
          }
        })
        .catch(err => console.log(err));
    }
  });
}

function onSearch(evt) {
  evt.preventDefault();
  loadBtn.style.display = 'none';

  const { searchQuery } = evt.currentTarget.elements;
  const searchWords = searchQuery.value.split(' ').join('+');
  console.log('searchWords', searchWords);

  getImages(searchWords, currentPage)
    .then(data => {
      console.log('data.hits', data.hits);

      if (data.hits.length) {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
      } else {
        Notify.failure('Oops! Something went wrong! Try reloading the page!');
      }

      gallery.innerHTML = createMarkup(data.hits);

      observer.observe(target);

      const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
      console.log('lightbox', lightbox);

      // gallery.on('error.simplelightbox', function (e) {
      //   console.log(e);
      // });

      loadBtn.style.display = 'block';
    })
    .catch(err => console.log(err));
}

function getImages(searchWords, currentPage) {
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
            <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="200"/></a>
            <div class="info">
              <p class="info-item">
                <b>Likes ${likes}</b>
              </p>
              <p class="info-item">
                <b>Views ${views}</b>
              </p>
              <p class="info-item">
                <b>Comments ${comments}</b>
              </p>
              <p class="info-item">
                <b>Downloads ${downloads}</b>
              </p>
            </div>
        </div>`;
      }
    )
    .join('');
}
