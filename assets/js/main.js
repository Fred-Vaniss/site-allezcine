// Affiche la popup qui check l'age au chargement de la page
$(window).on('load', () => {
    $('#myModal').modal('show');
});

// Validation de la popup qui check l'age
const validate = document.getElementById('validate');
validate.addEventListener('click', () => {
    const dateField = document.getElementById('inputDate').value;
    const dateSplit = dateField.split('-');
    const day = dateSplit[2];
    const month = dateSplit[1];
    const year = dateSplit[0];
    const date = new Date();
    const yearNow = date.getFullYear();
    const monthNow = date.getMonth() + 1;
    const dayNow = date.getDate();
    let age = 0;
    age = yearNow - year;
    if (monthNow >= month) {
        if (dayNow > day) {
            age--;
        }
    }
    if (age < 18) {
        window.location.replace("https://www.imdb.com/");
    }
})