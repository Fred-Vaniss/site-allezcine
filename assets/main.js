let films = {};
let req = new XMLHttpRequest();
req.open("GET", "https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=2014-09-15&primary_release_date.lte=2014-10-22&api_key=3b4cac2f6fd40d51e8ffc2881ade3885", true)
req.onreadystatechange = function () {
  if (req.readyState === XMLHttpRequest.DONE){
      if(req.status == 200){
          films = JSON.parse(req.responseText);
          console.log(films)
      } else {
          console.error(`Erreur ${req.status}`)
      }
  }
};
req.send();