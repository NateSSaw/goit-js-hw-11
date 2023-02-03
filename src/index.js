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
loadMoreBtn.button.addEventListener('click', fetchMoreImages);

function onSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;
  searchImages.searchQuery = form.elements.searchQuery.value.trim();
  clearGalleryList();
  searchImages.resetPage();
  loadMoreBtn.show();

  fetchMoreImages();
}

async function fetchMoreImages() {
  loadMoreBtn.disable();
  try {
    const newSearch = await searchImages.fetchImages();
    console.log(newSearch.data.hits);
    if (newSearch.data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.hide();
    } else if (newSearch.data.hits.length < 40) {
      createMarkup(newSearch.data);
      loadMoreBtn.hide();
      Notify.success(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      Notify.success(`Hooray! We found ${newSearch.data.totalHits} images.`),
        createMarkup(newSearch.data);
      loadMoreBtn.enable();
    }
  } catch (err) {
    onError(err);
  } finally {
    form.reset();
  }
}
function createMarkup({ hits }) {
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
