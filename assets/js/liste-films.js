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
    console.log(`Requested ${url}`)
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
//  Requête de la liste des films en salle
/////////////////////////////////////////////////

let movieGenresRequest

function requestMoviesInTheater(){
    let moviesRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1&region=fr`);
    movieGenresRequest = ajaxRequest(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-EN`);
    
    //  Vérification si ces deux requêtes ont bien étés abouties avant de lister les films
    Promise.all([moviesRequest, movieGenresRequest]).then(values => {
        listMovies("movie",values[0],values[1],moviesTarget,0,5,true)
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
//  Liste des cinq films dans les salles
/////////////////////////////////////////
function listMovies (type,movies, genres, target, index, amount, clean) {
    if (clean){
        target.innerHTML = ""
    }
    for (let i = index; i < index+amount ; i++) {
        let entry = document.createElement("div");
        entry.className = "movie-entry"
        entry.setAttribute("data-toggle","modal")
        entry.setAttribute("data-target", ".modal-info-movie")
        entry.id = movies.results[i].id

        let img = document.createElement("img");
        let title = document.createElement("h3");
        let details = document.createElement("div")
        let genre = document.createElement("p");
        let year = document.createElement("p");

        img.src = `https://image.tmdb.org/t/p/w500/${movies.results[i].poster_path}`;
        img.className = "movie-poster"

        if (type == "movie"){
            entry.title = movies.results[i].original_title;
            title.textContent = movies.results[i].original_title;
            year.textContent = movies.results[i].release_date.substr(0,4);
        } else{
            entry.title = movies.results[i].original_name;
            title.textContent = movies.results[i].original_name;
            year.textContent = movies.results[i].first_air_date.substr(0,4);
        }
        title.className = "movie-title"
        year.className = "movie-year-genre"

        // Affichage du genre (on cherche la première ID sur la deuxième API demandé pour avoir le nom du genre)
        if (movies.results[i].genre_ids.length > 0){
            let genreFind = genres.genres.find(genre => genre.id == movies.results[i].genre_ids[0])
            genre.innerText += genreFind.name
        }
        genre.className = "movie-year-genre"


        entry.appendChild(img);
        entry.appendChild(title);
        details.appendChild(year);
        details.appendChild(genre);
        details.className = "movie-details"
        entry.appendChild(details)

        target.appendChild(entry)

        if(type == "movie"){
            entry.addEventListener("click", () => gatherMovieDetails(movies.results[i].id, movies.results[i].original_title))
        } else {
            entry.addEventListener("click", () => gatherSerieDetails(movies.results[i].id, movies.results[i].original_name))
        }
    }
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
        listMovies("movie",values[0],values[1],featMoviesTarget,displayedMovies,12,true)
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
        listMovies("movie",featMoviesFullList,values[1],featMoviesTarget,displayedMovies,12,false)
        displayedMovies += 12
        console.log("displayed")
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
for (const btn of moviesGenreBtns) {
    btn.addEventListener("click", () => {
        document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.remove("btn-primary")
        document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.add("btn-outline-primary")

        movieGenre = btn.getAttribute("data-genre")
        moviePage = 1
        displayedMovies = 0
        featMoviesFullList = {"results":[]}
        requestFeatMovies()

        document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.remove("btn-outline-primary")
        document.getElementsByClassName(`movie-${movieGenre}`)[0].classList.add("btn-primary")
    })
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

let serieGenresRequest

function requestFeatSeries(){
    let genreRequest = `&with_genres=${serieGenre}`
    if (serieGenre == "null"){
        genreRequest = ""
    }
    let featSeriesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${seriePage}&timezone=America%2FNew_York&include_null_first_air_dates=false${genreRequest}`)
    serieGenresRequest = ajaxRequest(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`)

    Promise.all([featSeriesRequest, serieGenresRequest]).then(values => {
        for (const item of values[0].results) {
            featSeriesFullList.results.push(item)
        }
        listMovies("serie",values[0],values[1],featSeriesTarget,displayedSeries,12,true)
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
        console.log(values[0])
        for (const item of values[0].results) {
            featSeriesFullList.results.push(item)
        }
        listMovies("serie",featSeriesFullList,values[1],featSeriesTarget,displayedSeries,12,false)
        displayedSeries += 12
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
        let errorMsg = document.createElement("p")
        featSeriesTarget.innerHTML = `Erreur ${reason}`
        featSeriesTarget.style.fontSize = '3em'
        featSeriesTarget.style.justifyContent = 'center'
    })
})

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
            if (trailerFind.site){
                if (trailerFind.site != "YouTube"){
                    trailerFind = undefined
                }
            }
            v++
        } 
    
        ul.appendChild(status)
        ul.appendChild(date)
        ul.appendChild(director)
        ul.appendChild(cast)
    
        infoMovieTarget.innerHTML = ""
        infoMovieTarget.appendChild(img)
        infoMovieTarget.appendChild(desc)
        infoMovieTarget.appendChild(ul)

        if(trailerFind){
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
//  Requête des détails et des bandes d'annonce du film
/////////////////////////////////////////////////////////
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
        for(let i = 0; i < 3; i++) {
            topCast += `${credits.cast[i].name}, `
        }
        cast.innerText = `Featured cast: ${topCast}`

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
    } catch (err) {
        console.error(err)
        infoMovieTarget.innerHTML = `Un erreur est survenue lors de la récupération des détails du film <br> ${err}`
    }
}