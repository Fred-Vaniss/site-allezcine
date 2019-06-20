// Création du bouton
let createbtn = document.createElement("A");
createbtn.innerHTML = "<i class='fas fa-xs fa-arrow-up'></i>"
createbtn.setAttribute('id', 'btnscroll');
createbtn.setAttribute('href', '#up');
document.body.appendChild(createbtn);
let btnscroll = document.getElementById("btnscroll");

//Fonction qui fait apparaitre et disparaitre le bouton en fonction du scroll
document.addEventListener('DOMContentLoaded', function () {
    window.onscroll = (function (event) {
        if (window.pageYOffset >= 550) {
            btnscroll.style.display = "inline";
        } else {
            btnscroll.style.display = "none";
        };
    });
});