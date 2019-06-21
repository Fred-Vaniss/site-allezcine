//
//  Ce fichier JS traite la partie liste des films
//

let moviesTarget = document.getElementById("movies-target")
let featMoviesTarget = document.getElementById("feat-movies-target")
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
//  Requête de la liste des films
/////////////////////////////////////////////////

let genresRequest

function requestMoviesInTheater(){
    let moviesRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1&region=fr`);
    genresRequest = ajaxRequest(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-EN`);
    
    //  Vérification si ces deux requêtes ont bien étés abouties avant de lister les films
    Promise.all([moviesRequest, genresRequest]).then(values => {
        listMovies(values[0],values[1],moviesTarget,5,true)
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
function listMovies (movies, genres, target, amount, clean) {
    if (clean){
        target.innerHTML = ""
    }
    for (let i = 0; i < amount ; i++) {
        let entry = document.createElement("div");
        entry.className = "movie-entry"
        entry.title = movies.results[i].original_title
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

        title.textContent = movies.results[i].original_title;
        title.className = "movie-title"

        year.textContent = movies.results[i].release_date.substr(0,4);
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

        entry.addEventListener("click", () => gatherMovieDetails(movies.results[i].id, movies.results[i].original_title))
    }
}

/////////////////////////////////////////
//
// Liste des films en vedette
//
/////////////////////////////////////////
let moviePage = 1

function requestFeatMovies(genre = "null"){
    let genreRequest = `&with_genres=${genre}`
    if (genre = "null"){
        genreRequest = ``
    }
    let featMoviesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/movie?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${moviePage}${genre}`)

    Promise.all([featMoviesRequest, genresRequest]).then(values => {
        listMovies(values[0],values[1],featMoviesTarget,12,true)
    }, reason => {
        console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
        let errorMsg = document.createElement("p")
        featMoviesTarget.innerHTML = `Erreur ${reason}`
        featMoviesTarget.style.fontSize = '3em'
        featMoviesTarget.style.justifyContent = 'center'
    })
}

requestFeatMovies()

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