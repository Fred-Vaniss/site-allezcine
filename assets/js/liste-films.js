//
//  Ce fichier JS traite la partie liste des films
//

let moviesTarget = document.getElementById("movies-target")
let movieTrailers, genres;

//
//  Requête de la liste des films
/////////////////////////////////////////////////
let movieListRequest = new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open("GET", "https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=2018-09-15&primary_release_date.lte=2018-10-22&api_key=3b4cac2f6fd40d51e8ffc2881ade3885", true)
    req.send();
    req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status == 200) {
                movieTrailers = JSON.parse(req.responseText);
                resolve(movieTrailers)
            } else {
                console.error(`Erreur ${req.status} lors le la requête des films`)
                reject(req.status)
            }
        };
    };
})

//
//  Requête de la liste des genres
/////////////////////////////////////////////////
let genreListRequest = new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open("GET", "https://api.themoviedb.org/3/genre/movie/list?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-EN", true)
    req.send();
    req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status == 200) {
                genres = JSON.parse(req.responseText);
                resolve(genres)
            } else {
                console.error(`Erreur ${req.status} lors de la requête des genres`)
                reject(req.status)
            }
        }
    }
})



//
//  Vérification si ces deux requêtes ont bien étés abouties avant de lister les films
///////////////////////////////////////////////////////////////////////////////////////
Promise.all([movieListRequest,genreListRequest]).then(values => {
    listMovies(values[0],values[1])
}, reason => {
    console.error(`Une des promesses n'a pas été tenue (${reason}) lors de la récupération des films`)
    let errorMsg = document.createElement("p")
    moviesTarget.innerHTML = `Erreur ${reason}`
    moviesTarget.style.fontSize = '3em'
    moviesTarget.style.justifyContent = 'center'
})

//
//  Liste des cinq films
///////////////////////////////////
function listMovies (movies, genres) {
    for (let i = 0; i <= 5 ; i++) {
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
        let genreFind = genres.genres.find(genre => genre.id == movies.results[i].genre_ids[0])
        genre.innerText += genreFind.name
        genre.className = "movie-year-genre"


        entry.appendChild(img);
        entry.appendChild(title);
        details.appendChild(year);
        details.appendChild(genre);
        details.className = "movie-details"
        entry.appendChild(details)

        moviesTarget.appendChild(entry)

        entry.addEventListener("click", () => gatherMovieDetails(movies.results[i].id))
    }
}


/////////////////////////////////////////
//
// Ouverture des détails d'un film
//
/////////////////////////////////////////

function gatherMovieDetails (movieID){
    console.log(movieID)

    //
    //  Requête des détails du film
    ///////////////////////////////////////////////////
    let detailsRequest = new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open("GET", `https://api.themoviedb.org/3/movie/${movieID}?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US`, true)
        req.send();
        req.onreadystatechange = () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status == 200) {
                    let movieDetails = JSON.parse(req.responseText);
                    resolve(movieDetails)
                } else {
                    console.error(`Erreur ${req.status} lors le la requête des détails du film`)
                    reject(req.status)
                }
            };
        };
    })

    //
    //  Requête de la liste des bandes d'annonces
    ///////////////////////////////////////////////////
    let trailerRequest = new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open("GET", `https://api.themoviedb.org/3/movie/${movieID}/videos?api_key=3b4cac2f6fd40d51e8ffc2881ade3885&language=en-US`, true)
        req.send();
        req.onreadystatechange = () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status == 200) {
                    let movieTrailers = JSON.parse(req.responseText);
                    resolve(movieTrailers)
                } else {
                    console.error(`Erreur ${req.status} lors le la requête des détails du film`)
                    reject(req.status)
                }
            };
        };
    })

    Promise.all([detailsRequest, trailerRequest]).then(values => {
        displayMovieDetails(values[0],values[1])
    }), reason => {
        console.error(`Une des promesses n'a pas été tenue lors de la récupération des détails du film.`)
    }
}

function displayMovieDetails (details, trailers) {
    console.log(details)
    console.log(trailers.results)
}