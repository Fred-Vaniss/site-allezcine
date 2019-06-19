//
//  Requête de la liste des films
/////////////////////////////////////////////////
let movieListRequest = new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open("GET", "https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=2014-09-15&primary_release_date.lte=2014-10-22&api_key=3b4cac2f6fd40d51e8ffc2881ade3885", true)
    req.send();
    req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status == 200) {
                let movies = JSON.parse(req.responseText);
                resolve(movies)
            } else {
                console.error(`Erreur ${req.status} lors le la requête des films`)
                reject(req.status)
            }
        }
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
                let genres = JSON.parse(req.responseText);
                resolve(genres)
            } else {
                console.error(`Erreur ${req.status} lors de la requête des genres`)
                reject(req.status)
            }
        }
    }
})



//
//  Vérificcation si ces deux requêtes ont bien étés abouties
////////////////////////////////////////////////////////////////
Promise.all([movieListRequest,genreListRequest]).then(values => {
    listMovies(values[0],values[1])
}, reason => {
    console.error("Une des promesses n'a pas été tenue")
})


function listMovies (movies, genres) {
    console.log(movies)
    console.log(genres)
}