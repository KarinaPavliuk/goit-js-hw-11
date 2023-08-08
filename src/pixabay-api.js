import axios from 'axios';
axios.defaults.headers.common['x-api-key'] =
  '38592698-fb670dc072756c252ce931a2b';

function getImages(searchWords, currentPage) {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '38592698-fb670dc072756c252ce931a2b';

  return fetch(
    `${BASE_URL}?key=${KEY}&q=${searchWords}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`
  ).then(resp => {
    if (!resp.ok) {
      throw new Error(resp.statusText);
    }
    return resp.json();
  });
}

export { getImages };
