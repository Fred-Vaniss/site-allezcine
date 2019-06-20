// Création du bouton
let createbtn = document.createElement("A");
let txt = document.createTextNode("↑");
createbtn.setAttribute('id', 'btnscroll');
createbtn.setAttribute('href', '#up');
createbtn.appendChild(txt);
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