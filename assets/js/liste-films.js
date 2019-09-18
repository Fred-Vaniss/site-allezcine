//
//  Ce fichier JS traite la partie liste des films
//

let moviesTarget = document.getElementById("movies-target")
let infoMovieTarget = document.getElementById("info-movie-target")
let moviesList, genres;
let apiKey = `3b4cac2f6fd40d51e8ffc2881ade3885`;

let date = new Date()
let formatedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`

//
//  Fonction de la requête de l'API
//////////////////////////////////////////
function ajaxRequest (url){
    return new Promise((resolve,reject) => {
        let req = new XMLHttpRequest();
        req.open("GET", url, true)
        req.send();
        req.onreadystatechange = () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status == 200) {
                    moviesList = JSON.parse(req.responseText);
                    resolve(moviesList)
                } else {
                    console.error(`Erreur ${req.status} lors le la requête des films`)
                    reject(req.status)
                }
            };
        };
    })
}

//
//  Requête de la liste des genres
/////////////////////////////////////////////////

let movieGenresRequest
let serieGenresRequest

function requestGenresList(){
    movieGenresRequest = ajaxRequest(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-EN`);
    serieGenresRequest = ajaxRequest(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`);

    Promise.all([movieGenresRequest,serieGenresRequest]).then(values => {
        return genresListPush(values[0],values[1])
    }, reason => {
        console.error(`Une des promesses n'ont pas été tenue lors de la requête des genres`)
    })
}

let genresList = {"genres":[]}

function genresListPush(movie,serie){
    
    for (const genre of movie.genres) {
        genresList.genres.push(genre)
    }
    for (const genre of serie.genres) {
        genresList.genres.push(genre)
    }
}


requestGenresList()

//
//  Requête de la liste des films en salle
/////////////////////////////////////////////////

function requestMoviesInTheater(){
    let moviesRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1&region=FR`);
    
    //  Vérification si ces deux requêtes ont bien étés abouties avant de lister les films
    Promise.all([moviesRequest, movieGenresRequest]).then(values => {
        listMovies("movie",values[0],moviesTarget,0,5,true)
        bannerMovies(values[0])
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
        let errorMsg = document.createElement("p")
        moviesTarget.innerHTML = `Erreur ${reason}`
        moviesTarget.style.fontSize = '3em'
        moviesTarget.style.justifyContent = 'center'
    })
}

requestMoviesInTheater();


//
//  Fonction générale pour lister la liste des films
//////////////////////////////////////////////////////
function listMovies (type,movies, target, index, amount, clean) {
    if (clean){
        target.innerHTML = ""
    }
    for (let i = index; i < index+amount ; i++) {
        let entry = document.createElement("div");
        if (type == "movie" || type == "serie"){
            entry.setAttribute("data-toggle","modal")
            entry.setAttribute("data-target", "#modal-info-movie")
        }
        entry.id = movies.results[i].id
        

        let img = document.createElement("img");
        let title = document.createElement("h3");
        let details = document.createElement("div");
        let genre = document.createElement("p");
        let year = document.createElement("p");
        let shopDetails = document.createElement("div")
        let price = document.createElement("p");

        if(movies.results[i].poster_path){
            img.src = `https://image.tmdb.org/t/p/w185/${movies.results[i].poster_path}`;
        } else {
            img.src = "assets/img/no-poster.jpg"
        }
        img.className = "movie-poster"

        if (type == "movie" || type == "shop"){
            entry.title = movies.results[i].title;
            title.textContent = movies.results[i].title;
            year.textContent = movies.results[i].release_date.substr(0,4);
        } else if (type = "serie"){
            entry.title = movies.results[i].name;
            title.textContent = movies.results[i].name;
            year.textContent = movies.results[i].first_air_date.substr(0,4);
        }
        title.className = "movie-title"
        year.className = "movie-year-genre"

        // Affichage du genre (on cherche la première ID sur la deuxième API demandé pour avoir le nom du genre)
        if (type == "movie" || type == "serie"){
            entry.className = "movie-entry"
            if (movies.results[i].genre_ids.length > 0){
                let genreFind = genresList.genres.find(genre => genre.id == movies.results[i].genre_ids[0])
                genre.innerText += genreFind.name
            }
            genre.className = "movie-year-genre"
        } else {
            entry.className = "shop-entry"
            price.innerText = "15€"
            price.className = "movie-year-genre"
        }

        entry.appendChild(img);
        if (type == "movie" || type == "serie"){
            entry.appendChild(title);
            details.appendChild(year);
            details.appendChild(genre);
            details.className = "movie-details"
            entry.appendChild(details);
        } else {
            shopDetails.className = "shop-entry-details"
            shopDetails.appendChild(title);
            details.appendChild(year);
            details.appendChild(price);
            details.className = "movie-details"
            shopDetails.appendChild(details)
            entry.appendChild(shopDetails)
        }

        target.appendChild(entry)

        if(type == "movie"){
            entry.addEventListener("click", () => gatherMovieDetails(movies.results[i].id, movies.results[i].title))
        } else if (type == "serie") {
            entry.addEventListener("click", () => gatherSerieDetails(movies.results[i].id, movies.results[i].name))
        } else {
            entry.addEventListener("click", () => gatherShopDetails(movies.results[i].id))
        }
    }
}

/////////////////////////////////////////
//
// Bannière du header
//
/////////////////////////////////////////


//
//  Images 4 films dans la bannière
//////////////////////////////////////

function bannerMovies (movies) {
    let banners = document.getElementsByClassName("banner-movie")
    let carouBtns = document.getElementsByClassName("carousel-button")
    for (let i = 0; i < 5; i++) {
        banners[i].setAttribute("src", `https://image.tmdb.org/t/p/original/${movies.results[i].backdrop_path}`)
        carouBtns[i].setAttribute("data-id", movies.results[i].id)
        carouBtns[i].setAttribute("data-name", movies.results[i].title)
    }
}

//
//  Boutton "watch trailer"
//////////////////////////////////////

document.getElementById("trailer-btn").addEventListener("click", () => {
    let activeImg = document.querySelector(".carousel-button.active")
    let movieID = activeImg.getAttribute("data-id")
    document.getElementById("trailer-movie-title").innerText = activeImg.getAttribute("data-name")

    let trailerRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/${movieID}/videos?api_key=${apiKey}&language=en-US`).then(value => {
        displayBannerTrailer(value)
    })
})

function displayBannerTrailer(trailers) {
    let target = document.getElementById("banner-trailer-target")
    let video = document.createElement("div")
    video.className = "detail-video-container"

    let v = 0
    let trailerFind
    while (v < trailers.results.length && trailerFind == undefined)  {
        trailerFind = trailers.results.find(trailer => trailer.type == "Trailer")
        if (typeof trailerFind != "undefined"){
            if (trailerFind.site != "YouTube"){
                trailerFind = undefined
            }
        }
        v++
        if(v == trailers.results.length){
            trailerFind = trailers.results[0]
        }
    } 

    if(typeof trailerFind != "undefined"){
        video.innerHTML = `<iframe class="detail-video" width="560" height="315" src="https://www.youtube.com/embed/${trailerFind.key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        infoMovieTarget.appendChild(video)
    }

    target.innerHTML = ""
    target.appendChild(video)
}

/////////////////////////////////////////
//
// Liste des films en vedette
//
/////////////////////////////////////////
let featMoviesTarget = document.getElementById("feat-movies-target")

let featMoviesFullList = {"results":[]}
let movieGenre = "null"
let displayedMovies = 0
let moviePage = 1

function requestFeatMovies(){
    let genreRequest = `&with_genres=${movieGenre}`
    if (movieGenre == "null"){
        genreRequest = ""
    }
    let featMoviesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/movie?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${moviePage}${genreRequest}`)

    Promise.all([featMoviesRequest, movieGenresRequest]).then(values => {
        for (const item of values[0].results) {
            featMoviesFullList.results.push(item)
        }
        listMovies("movie",values[0],featMoviesTarget,displayedMovies,12,true)
        displayedMovies += 12
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
        let errorMsg = document.createElement("p")
        featMoviesTarget.innerHTML = `Erreur ${reason}`
        featMoviesTarget.style.fontSize = '3em'
        featMoviesTarget.style.justifyContent = 'center'
    })
}

requestFeatMovies()

//
// Afficher plus de films
//////////////////////////////::
document.getElementById("more-movie-btn").addEventListener("click", () => {
    moviePage++

    let genreRequest = `&with_genres=${movieGenre}`
    if (movieGenre == "null"){
        genreRequest = ""
    }
    let featMoviesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/movie?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${moviePage}${genreRequest}`)
    Promise.all([featMoviesRequest, movieGenresRequest]).then(values => {
        for (const item of values[0].results) {
            featMoviesFullList.results.push(item)
        }
        listMovies("movie",featMoviesFullList,featMoviesTarget,displayedMovies,12,false)
        displayedMovies += 12
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
        let errorMsg = document.createElement("p")
        featMoviesTarget.innerHTML = `Erreur ${reason}`
        featMoviesTarget.style.fontSize = '3em'
        featMoviesTarget.style.justifyContent = 'center'
    })
})

//
//  Filtre des genres des films
////////////////////////////////////
let moviesGenreBtns = document.getElementsByClassName("filter-movie")
let moviesGenreNav = document.getElementsByClassName("filter-movie-nav")

filterMovieEventListener (moviesGenreBtns)
filterMovieEventListener (moviesGenreNav)

function filterMovieEventListener (buttons){
    for (const btn of buttons) {
        btn.addEventListener("click", () => {
            let genreId = btn.getAttribute("data-genre")
            filterMovieGenre(genreId)
        })
    }
}

function filterMovieGenre (genreId) {
    document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.remove("btn-primary")
    document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.add("btn-outline-primary")

    movieGenre = genreId
    moviePage = 1
    displayedMovies = 0
    featMoviesFullList = {"results":[]}
    requestFeatMovies()

    document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.remove("btn-outline-primary")
    document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.add("btn-primary")
}

/////////////////////////////////////////
//
// Liste des séries en vedette
//
/////////////////////////////////////////
let featSeriesTarget = document.getElementById("feat-series-target")

let featSeriesFullList = {"results":[]}
let serieGenre = "null"
let displayedSeries = 0
let seriePage = 1

function requestFeatSeries(){
    let genreRequest = `&with_genres=${serieGenre}`
    if (serieGenre == "null"){
        genreRequest = ""
    }
    let featSeriesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${seriePage}&timezone=America%2FNew_York&include_null_first_air_dates=false${genreRequest}`)

    Promise.all([featSeriesRequest, serieGenresRequest]).then(values => {
        for (const item of values[0].results) {
            featSeriesFullList.results.push(item)
        }
        listMovies("serie",values[0],featSeriesTarget,displayedSeries,12,true)
        displayedSeries += 12
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
        let errorMsg = document.createElement("p")
        featSeriesTarget.innerHTML = `Erreur ${reason}`
        featSeriesTarget.style.fontSize = '3em'
        featSeriesTarget.style.justifyContent = 'center'
    })
}

requestFeatSeries()

//
// Afficher plus de séries
/////////////////////////////
document.getElementById("more-serie-btn").addEventListener("click", () => {
    seriePage++

    let genreRequest = `&with_genres=${serieGenre}`
    if (serieGenre == "null"){
        genreRequest = ""
    }
    let featSeriesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/tv?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US&sort_by=popularity.desc&page=${seriePage}&timezone=America%2FNew_York&include_null_first_air_dates=false${genreRequest}`)
    Promise.all([featSeriesRequest, serieGenresRequest]).then(values => {
        for (const item of values[0].results) {
            featSeriesFullList.results.push(item)
        }
        listMovies("serie",featSeriesFullList,featSeriesTarget,displayedSeries,12,false)
        displayedSeries += 12
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
        let errorMsg = document.createElement("p")
        featSeriesTarget.innerHTML = `Erreur ${reason}`
        featSeriesTarget.style.fontSize = '3em'
        featSeriesTarget.style.justifyContent = 'center'
    })
})

//
//  Filtre des genres des séries
////////////////////////////////////
let seriesGenreBtns = document.getElementsByClassName("filter-serie")
let seriesGenreNav = document.getElementsByClassName("filter-serie-nav")

filterSerieEventListener(seriesGenreBtns)
filterSerieEventListener(seriesGenreNav)

function filterSerieEventListener (buttons){
    for (const btn of buttons) {
        btn.addEventListener("click", () => {
            let genreId = btn.getAttribute("data-genre")
            filterSerieGenre(genreId)
        })
    }
}

function filterSerieGenre (genreId) {
    document.getElementsByClassName(`serie-${serieGenre}`)[0].classList.remove("btn-primary")
    document.getElementsByClassName(`serie-${serieGenre}`)[0].classList.add("btn-outline-primary")

    serieGenre = genreId
    seriePage = 1
    displayedSeries = 0
    featSeriesFullList = {"results":[]}
    requestFeatSeries()

    document.getElementsByClassName(`serie-${serieGenre}`)[0].classList.remove("btn-outline-primary")
    document.getElementsByClassName(`serie-${serieGenre}`)[0].classList.add("btn-primary")
}



/////////////////////////////////////////
//
// Ouverture des détails d'un film
//
/////////////////////////////////////////

//
//  Requête des détails et des bandes d'annonce du film
/////////////////////////////////////////////////////////
function gatherMovieDetails (movieID, movieTitle){
    document.getElementById("info-movie-title").innerHTML = movieTitle
    infoMovieTarget.innerHTML = "<h1>Chargement...</h1>"


    //  Appel des trois requêtes
    let detailsRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}&language=en-US`)
    let trailerRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/${movieID}/videos?api_key=${apiKey}&language=en-US`)
    let castRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/${movieID}/credits?api_key=${apiKey}`)

    //  Vérification si tous les requêtes ont étés abouties
    Promise.all([detailsRequest, trailerRequest, castRequest]).then(values => {
        displayMovieDetails(values[0],values[1],values[2])
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue lors de la récupération des détails du film.`)
        infoMovieTarget.innerHTML = `Un erreur est survenue lors de la récupération des détails du film <br> ${reason}`
    })
}

//
//  Affichage des détails du film
///////////////////////////////////////////////////
function displayMovieDetails (details, trailers, credits) {
    try{
        let desc = document.createElement("p")
        desc.innerText = details.overview
    
        let img = document.createElement("img")
        img.src = `https://image.tmdb.org/t/p/w780/${details.backdrop_path}`
        img.className = "detail-img"
    
        let ul = document.createElement("ul")
        let status = document.createElement("li")
        let date = document.createElement("li")
        let director = document.createElement("li")
        let cast = document.createElement("li")
        let video = document.createElement("div")
        video.className = "detail-video-container"
    
        status.innerText = details.status
        date.innerText = details.release_date
        director.innerText = `Directed by: ${credits.crew[0].name}`
    
        let topCast = ""
        for(let i = 0; i < 3; i++) {
            topCast += `${credits.cast[i].name}, `
        }
        cast.innerText = `Featured cast: ${topCast}`
        
        let v = 0
        let trailerFind
        while (v < trailers.results.length && trailerFind == undefined)  {
            trailerFind = trailers.results.find(trailer => trailer.type == "Trailer")
            if (typeof trailerFind != "undefined"){
                if (trailerFind.site != "YouTube"){
                    trailerFind = undefined
                }
            }
            v++
            if(v == trailers.results.length){
                trailerFind = trailers.results[0]
            }
        } 
    
        ul.appendChild(status)
        ul.appendChild(date)
        ul.appendChild(director)
        ul.appendChild(cast)
    
        infoMovieTarget.innerHTML = ""
        infoMovieTarget.appendChild(img)
        infoMovieTarget.appendChild(desc)
        infoMovieTarget.appendChild(ul)

        if(typeof trailerFind != "undefined"){
            video.innerHTML = `<iframe class="detail-video" width="560" height="315" src="https://www.youtube.com/embed/${trailerFind.key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            infoMovieTarget.appendChild(video)
        }
    } catch (err) {
        console.error(err)
        infoMovieTarget.innerHTML = `Un erreur est survenue lors de la récupération des détails du film <br> ${err}`
    }
    
}

/////////////////////////////////////////
//
// Ouverture des détails d'une série
//
/////////////////////////////////////////

//
//  Requête des détails et des bandes d'annonce de la série
/////////////////////////////////////////////////////////////
function gatherSerieDetails(serieID, serieTitle){
    document.getElementById("info-movie-title").innerHTML = serieTitle
    infoMovieTarget.innerHTML = "<h1>Chargement...</h1>"

    // Appel des requêtes
    let detailsRequest = ajaxRequest(`https://api.themoviedb.org/3/tv/${serieID}?api_key=${apiKey}&language=en-US`)
    let trailerRequest = ajaxRequest(`https://api.themoviedb.org/3/tv/${serieID}/videos?api_key=${apiKey}&language=en-US`)
    let castRequest = ajaxRequest(`https://api.themoviedb.org/3/tv/${serieID}/credits?api_key=${apiKey}&language=en-US`)

    Promise.all([detailsRequest, trailerRequest, castRequest]).then(values => {
        displaySerieDetails(values[0],values[1],values[2])
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue lors de la récupération des détails du film.`)
        infoMovieTarget.innerHTML = `Un erreur est survenue lors de la récupération des détails de la série <br> ${reason}`
    })
}

//
//  Affichage des détails de la série
//////////////////////////////////////
function displaySerieDetails (details, trailers, credits){
    try{
        let desc = document.createElement("p")
        desc.innerText = details.overview

        let img = document.createElement("img")
        img.src = `https://image.tmdb.org/t/p/w780/${details.backdrop_path}`
        img.className = "detail-img"

        let ul = document.createElement("ul")
        let status = document.createElement("li")
        let date = document.createElement("li")
        let episodes = document.createElement("li")
        let seasons = document.createElement("li")
        let lastDate = document.createElement("li")
        let cast = document.createElement("li")
        let video = document.createElement("div")
        video.className = "detail-video-container"

        status.innerText = details.status
        date.innerText = `First air date: ${details.first_air_date}`

        episodes.innerText = `Episodes: ${details.number_of_episodes}`
        seasons.innerText = `Seasons: ${details.number_of_seasons}`

        lastDate.innerText = `Last air date: ${details.last_air_date}`

        let topCast = ""
        for(let i = 0; i < 3 && i < credits.cast.length; i++) {
            topCast += `${credits.cast[i].name}, `
        }
        cast.innerText = `Featured cast: ${topCast}`

        let v = 0
        let trailerFind
        while (v < trailers.results.length && trailerFind == undefined)  {
            trailerFind = trailers.results.find(trailer => trailer.type == "Trailer")
            if (typeof trailerFind != "undefined"){
                if (trailerFind.site != "YouTube"){
                    trailerFind = undefined
                }
            }
            v++
            if(v == trailers.results.length){
                trailerFind = trailers.results[0]
            }
        } 

        ul.appendChild(status)
        ul.appendChild(date)
        ul.appendChild(episodes)
        ul.appendChild(seasons)
        ul.appendChild(lastDate)
        ul.appendChild(cast)

        infoMovieTarget.innerHTML = ""
        infoMovieTarget.appendChild(img)
        infoMovieTarget.appendChild(desc)
        infoMovieTarget.appendChild(ul)

        if(typeof trailerFind != "undefined"){
            video.innerHTML = `<iframe class="detail-video" width="560" height="315" src="https://www.youtube.com/embed/${trailerFind.key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            infoMovieTarget.appendChild(video)
        }
    } catch (err) {
        console.error(err)
        infoMovieTarget.innerHTML = `Un erreur est survenue lors de la récupération des détails du film <br> ${err}`
    }
}

////////////////////////////////////////////////////
//
// Suppression video lors de la fermeture du modal
//
////////////////////////////////////////////////////

$('#modal-info-movie').on("hidden.bs.modal", function() {
    let video = document.getElementById("info-movie-target").getElementsByClassName("detail-video-container")[0]
    if (video){
        video.parentNode.removeChild(video)
    }
})

$('#modal-banner-trailer').on("hidden.bs.modal", function() {
    let video = document.getElementById("banner-trailer-target").getElementsByClassName("detail-video-container")[0]
    if (video){
        video.parentNode.removeChild(video)
    }
})

/////////////////////////////////////////
//
// Magasin
//
/////////////////////////////////////////
let shopNav = document.getElementsByClassName("shop-nav")[0]
let navDupe = document.importNode(shopNav,true)
let shopBtnsHaveEventListener = false

let shopTarget = document.getElementById("shop-list-target")
let shopDetailsTarget = document.getElementById("shop-selected-target")

function requestShopList() {
    let shopRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/movie?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US&include_adult=false&include_video=false&page=1&primary_release_date.lte=2018-12-31`)
    
    Promise.all([shopRequest, movieGenresRequest]).then(values => {
        listMovies("shop",values[0],shopTarget,0,8,true);
        firstShopDetails();
        shopIndexing();
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération du magasin`)
        let errorMsg = document.createElement("p")
        moviesTarget.innerHTML = `Erreur ${reason}`
        moviesTarget.style.fontSize = '3em'
        moviesTarget.style.justifyContent = 'center'
    })
}

requestShopList();

//
//  Attribution d'un index pour chaque film
/////////////////////////////////////////////
function shopIndexing (){
    let movies = document.getElementsByClassName("shop-entry")
    for(let i = 0; i < movies.length;i++){
        movies[i].setAttribute("index", i)
    }
}

//
//  Affichage automatique des détails du premier film de la liste
///////////////////////////////////////////////////////////////////
function firstShopDetails(){
    const shopList = document.getElementsByClassName("shop-entry")

    gatherShopDetails(shopList[0].getAttribute('id'))
}


//
//  Boutton suivant et précédent
///////////////////////////////////////////////////////////////////
let shopIndex = 0
document.getElementById("shop-next").addEventListener("click", () => nextShopMovie("next"))
document.getElementById("shop-previous").addEventListener("click", () => nextShopMovie("previous"))

function nextShopMovie(action){
    if (isNaN(shopIndex)){shopIndex = 0}

    if (action == "next"){
        shopIndex += 1
    } else {
        shopIndex -= 1
    }

    if (shopIndex > 7){
        shopIndex = 0
    } else if (shopIndex < 0){
        shopIndex = 7
    }

    let movies = document.getElementsByClassName("shop-entry")

    gatherShopDetails(movies[shopIndex].id)
}

//
//  Affichage des détails d'un film 
///////////////////////////////////////////////////////////////////
function gatherShopDetails(movieID) {
    shopIndex = document.getElementById(movieID).getAttribute("index")
    shopIndex = parseInt(shopIndex)

    let detailsRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}&language=en-US`)
    let trailerRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/${movieID}/videos?api_key=${apiKey}&language=en-US`)

    Promise.all([detailsRequest, trailerRequest]).then(values => {
        displayShopDetails(values[0],values[1]);
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue lors de la récupération des détails du film.`)
        infoMovieTarget.innerHTML = `Un erreur est survenue lors de la récupération des détails du film <br> ${reason}`
    })

}

function displayShopDetails(details, trailers){
    let target = document.getElementById("shop-selected-target")
    target.innerHTML = ""
    try{
        let video = document.createElement ("div")
        let detailsTarget = document.createElement ("div")
        let title = document.createElement("h2")

        let table = document.createElement("table")
        let rowOne = document.createElement("tr")
        let storyLineInd = document.createElement("td")
        let storyLineTarg = document.createElement("td")

        let rowTwo = document.createElement("tr")
        let releaseInd = document.createElement("td")
        let releaseTarg = document.createElement("td")

        let rowThree = document.createElement("tr")
        let genreInd = document.createElement("td")
        let genreTarg = document.createElement("td")

        let rowFour = document.createElement("tr")
        let priceInd = document.createElement("td")
        let priceTarg = document.createElement("td")

        target.appendChild(navDupe)

        if(!shopBtnsHaveEventListener){
            document.getElementById("shop-next").addEventListener("click", () => nextShopMovie("next"))
            document.getElementById("shop-previous").addEventListener("click", () => nextShopMovie("previous"))
            shopBtnsHaveEventListener = true
        }


        let v = 0
        let trailerFind
        while (v < trailers.results.length && trailerFind == undefined)  {
            trailerFind = trailers.results.find(trailer => trailer.type == "Trailer")
            if (typeof trailerFind != "undefined"){
                if (trailerFind.site != "YouTube"){
                    trailerFind = undefined
                }
            }
            v++
            if(v == trailers.results.length){
                trailerFind = trailers.results[0]
            }
        } 

        if(typeof trailerFind != "undefined"){
            video.innerHTML = `<iframe class="detail-video" width="560" height="315" src="https://www.youtube.com/embed/${trailerFind.key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            infoMovieTarget.appendChild(video)
        }

        title.textContent = details.title;
        storyLineInd.innerText = "Story line"
        storyLineTarg.innerText = details.overview;
        
        releaseInd.innerText = "Release on";
        releaseTarg.innerText = details.release_date;

        genreInd.innerText = "Genres"
        for(let i = 0; i < details.genres.length; i++) {
            genreTarg.innerText += details.genres[i].name;
            if(i < details.genres.length-1){
                genreTarg.innerText += " | "
            }
        }

        priceInd.innerText = "Price"
        priceTarg.innerText = "15 euro"

        video.className = "detail-video-container"
        target.appendChild(video)
        
        title.className = "shop-detail-title"
        detailsTarget.appendChild(title)

        storyLineInd.className = "shop-detail-subtitle"
        storyLineTarg.className = "shop-detail-desc"
        rowOne.appendChild(storyLineInd)
        rowOne.appendChild(storyLineTarg)
        table.appendChild(rowOne)
        
        releaseInd.className = "shop-detail-subtitle"
        releaseTarg.className = "shop-detail-desc"
        rowTwo.appendChild(releaseInd)
        rowTwo.appendChild(releaseTarg)
        table.appendChild(rowTwo)

        genreInd.className = "shop-detail-subtitle"
        genreTarg.className = "shop-detail-desc"
        rowThree.appendChild(genreInd)
        rowThree.appendChild(genreTarg)
        table.appendChild(rowThree)

        priceInd.className = "shop-detail-subtitle"
        priceTarg.className = "shop-detail-desc"
        rowFour.appendChild(priceInd)
        rowFour.appendChild(priceTarg)
        table.appendChild(rowFour)

        detailsTarget.className = "shop-details"
        detailsTarget.appendChild(table)
        target.appendChild(detailsTarget)

    } catch (err){
        console.error(err)
    }
}