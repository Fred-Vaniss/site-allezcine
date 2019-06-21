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
//  Requête de la liste des films
/////////////////////////////////////////////////

let genresRequest

function requestMoviesInTheater(){
    let moviesRequest = ajaxRequest(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1&region=fr`);
    genresRequest = ajaxRequest(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-EN`);
    
    //  Vérification si ces deux requêtes ont bien étés abouties avant de lister les films
    Promise.all([moviesRequest, genresRequest]).then(values => {
        listMovies(values[0],values[1],moviesTarget,0,5,true)
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
function listMovies (movies, genres, target, index, amount, clean) {
    if (clean){
        target.innerHTML = ""
    }
    for (let i = index; i < index+amount ; i++) {
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
let featMoviesFullList = {"results":[]}
let genre = "null"
let displayedMovies = 0
let moviePage = 1

function requestFeatMovies(){
    let genreRequest = `&with_genres=${genre}`
    if (genre == "null"){
        genreRequest = ""
    }
    let featMoviesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/movie?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${moviePage}${genreRequest}`)

    Promise.all([featMoviesRequest, genresRequest]).then(values => {
        for (const item of values[0].results) {
            featMoviesFullList.results.push(item)
        }
        listMovies(values[0],values[1],featMoviesTarget,displayedMovies,12,true)
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

    let genreRequest = `&with_genres=${genre}`
    if (genre == "null"){
        genreRequest = ""
    }
    let featMoviesRequest = ajaxRequest(`https://api.themoviedb.org/3/discover/movie?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${moviePage}${genreRequest}`)
    console.log(featMoviesRequest)
    Promise.all([featMoviesRequest, genresRequest]).then(values => {
        for (const item of values[0].results) {
            featMoviesFullList.results.push(item)
        }
        listMovies(featMoviesFullList,values[1],featMoviesTarget,displayedMovies,12,false)
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
//  Filtre des genres
////////////////////////
let moviesGenreBtns = document.getElementsByClassName("filter-movie")
for (const btn of moviesGenreBtns) {
    btn.addEventListener("click", () => {
        document.getElementsByClassName(`movie-${genre}`)[0].classList.remove("btn-primary")
        document.getElementsByClassName(`movie-${genre}`)[0].classList.add("btn-outline-primary")

        genre = btn.getAttribute("data-genre")
        moviePage = 1
        displayedMovies = 0
        requestFeatMovies()

        document.getElementsByClassName(`movie-${genre}`)[0].classList.remove("btn-outline-primary")
        document.getElementsByClassName(`movie-${genre}`)[0].classList.add("btn-primary")

    })
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