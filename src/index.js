import { Notify } from 'notiflix/build/notiflix-notify-aio';
// import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';
import LoadMoreBtn from './btnLoadMore.js';
import SearchImages from './searchAPI.js';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

const searchImages = new SearchImages();

form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', fetchImages);

function onSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;
  searchImages.query = form.elements.searchQuery.value.trim();
  clearGalleryList();
  searchImages.resetPage();
  loadMoreBtn.show();

  fetchImages().finally(() => form.reset());
}

function fetchImages() {
  loadMoreBtn.disable();
  return searchImages
    .fetchImages()
    .then(({ hits }) => {
      if (hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        createMarkup(hits);
        loadMoreBtn.enable();
      }
    })
    .catch(onError);
}

function createMarkup(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
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
</div>
    `
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGalleryList() {
  gallery.innerHTML = '';
}

function onError(err) {
  Notify.failure(err);
}
