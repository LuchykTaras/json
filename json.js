const API_KEY = 'tt3896198'; // Замініть за потреби на власний API Key від OMDB (наприклад: '3b09de21' тощо)

let currentSearchTitle = '';
let currentSearchType = '';
let currentPage = 1;
let totalResults = 0;

$(document).ready(function () {
  // Натискання кнопки Search
  $('#searchBtn').on('click', function () {
    const title = $('#titleInput').val().trim();
    const type = $('#typeSelect').val();

    if (!title) {
      alert('Please enter a movie title!');
      return;
    }

    currentSearchTitle = title;
    currentSearchType = type;
    currentPage = 1;

    // Ховаємо попередні деталі
    $('#detailsSection').hide();

    searchMovies(currentPage);
  });

  // Обробник натискання на кнопки пагінації
  $(document).on('click', '.page-btn', function () {
    const page = $(this).data('page');
    if (page && page !== currentPage) {
      currentPage = page;
      $('#detailsSection').hide();
      searchMovies(currentPage);
    }
  });

  // Обробник натискання на кнопку Details
  $(document).on('click', '.details-btn', function () {
    const imdbID = $(this).data('id');
    getMovieDetails(imdbID);
  });
});

// AJAX-запит для пошуку списку фільмів
function searchMovies(page) {
  $.ajax({
    url: 'https://www.omdbapi.com/',
    type: 'GET',
    dataType: 'json',
    data: {
      apikey: API_KEY,
      s: currentSearchTitle,
      type: currentSearchType,
      page: page
    },
    success: function (response) {
      if (response.Response === 'True') {
        $('#notFoundMsg').hide();
        $('#resultsSection').show();

        totalResults = parseInt(response.TotalResults || response.totalResults);
        renderMoviesList(response.Search);
        renderPagination(totalResults, page);
      } else {
        $('#resultsSection').hide();
        $('#notFoundMsg').show();
      }
    },
    error: function () {
      $('#resultsSection').hide();
      $('#notFoundMsg').text('Error fetching data from API!').show();
    }
  });
}

// Отрисовка карток фільмів
function renderMoviesList(movies) {
  const $container = $('#moviesList');
  $container.empty();

  movies.forEach(movie => {
    const poster = (movie.Poster && movie.Poster !== 'N/A') 
      ? movie.Poster 
      : 'https://via.placeholder.com/90x130?text=No+Image';

    const cardHtml = `
      <div class="movie-card">
        <img src="${poster}" alt="${movie.Title}">
        <div class="movie-info">
          <div>
            <div class="movie-type">${movie.Type}</div>
            <div class="movie-title">${movie.Title}</div>
            <div class="movie-year">${movie.Year}</div>
          </div>
          <button class="details-btn" data-id="${movie.imdbID}">Details</button>
        </div>
      </div>
    `;
    $container.append(cardHtml);
  });
}

// Генерація блоку пагінації
function renderPagination(total, page) {
  const $pagination = $('#pagination');
  $pagination.empty();

  const totalPages = Math.ceil(total / 10);
  if (totalPages <= 1) return;

  // Кнопка "назад" (<<)
  const prevDisabled = page === 1 ? 'disabled' : '';
  $pagination.append(`<button class="page-btn" data-page="${page - 1}" ${prevDisabled}>&lt;&lt;</button>`);

  // Відображаємо максимум 6 цифрових кнопок підряд для компактності
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, startPage + 5);
  
  if (endPage - startPage < 5) {
    startPage = Math.max(1, endPage - 5);
  }

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === page ? 'active' : '';
    $pagination.append(`<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`);
  }

  // Кнопка "вперед" (>>)
  const nextDisabled = page === totalPages ? 'disabled' : '';
  $pagination.append(`<button class="page-btn" data-page="${page + 1}" ${nextDisabled}>&gt;&gt;</button>`);
}

// AJAX-запит для отримання деталей конкретного фільму
function getMovieDetails(id) {
  $.ajax({
    url: 'https://www.omdbapi.com/',
    type: 'GET',
    dataType: 'json',
    data: {
      apikey: API_KEY,
      i: id,
      plot: 'full'
    },
    success: function (movie) {
      if (movie.Response === 'True') {
        renderMovieDetails(movie);
      }
    }
  });
}

// Отрисовка деталей фільму
function renderMovieDetails(movie) {
  const poster = (movie.Poster && movie.Poster !== 'N/A') 
    ? movie.Poster 
    : 'https://via.placeholder.com/220x330?text=No+Image';

  const html = `
    <img src="${poster}" alt="${movie.Title}">
    <table class="details-table">
      <tr>
        <td class="label-col">Title:</td>
        <td>${movie.Title}</td>
      </tr>
      <tr>
        <td class="label-col">Released:</td>
        <td>${movie.Released}</td>
      </tr>
      <tr>
        <td class="label-col">Genre:</td>
        <td>${movie.Genre}</td>
      </tr>
      <tr>
        <td class="label-col">Country:</td>
        <td>${movie.Country}</td>
      </tr>
      <tr>
        <td class="label-col">Director:</td>
        <td>${movie.Director}</td>
      </tr>
      <tr>
        <td class="label-col">Writer:</td>
        <td>${movie.Writer}</td>
      </tr>
      <tr>
        <td class="label-col">Actors:</td>
        <td>${movie.Actors}</td>
      </tr>
      <tr>
        <td class="label-col">Awards:</td>
        <td>${movie.Awards}</td>
      </tr>
    </table>
  `;

  $('#movieDetails').html(html);
  $('#detailsSection').show();

  // Плавне прокручування до блоку деталей
  $('html, body').animate({
    scrollTop: $('#detailsSection').offset().top - 20
  }, 400);
}