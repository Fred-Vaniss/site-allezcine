/////////////////////////////
//
//  Vérification de l'age
//
/////////////////////////////

//
// Affiche la popup qui check l'age au chargement de la page
/////////////////////////////////////////////////////////////////
if (localStorage.getItem('ageCheck') === "true") {
    console.log('age check is ok');
} else {
    $(window).on('load', () => {
        $('#ageModal').modal('show');
    });
}

//
// Validation de la popup qui check l'age
///////////////////////////////////////////
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
    if (dateField != "") {
        if (age >= 18) {
            $('#ageModal').modal('toggle');
            localStorage.setItem('ageCheck', true);
        } else if (age < 18) {
            window.location.href = "https://www.imdb.com/";
            localStorage.setItem('ageCheck', false);
        } else {
            console.log('erreur');
            localStorage.setItem('ageCheck', false);
        }
    }
})


//Affiche le GDPR seulement si le GDPR check != true
if (localStorage.getItem('GDPRCheck') === "true") {
    console.log('GDPR check is ok');
} else {
    $(window).on('load', () => {
        $('#bandeauGPDR').collapse('show');
    });
}
const collapseGPDR = document.getElementById('collapseGPDR');
collapseGPDR.addEventListener('click', () => localStorage.setItem('GDPRCheck', true));



/////////////////////////////////////
//
//  Mot de passe et formulaire
//
/////////////////////////////////////

//
//Vérification password
/////////////////////////////
let passeone = document.querySelector('#Password1');
let passetwo = document.querySelector('#Password2');

document.querySelector('.butt-enregistrer').addEventListener('click', () => {
    if (passeone !== passetwo) {
        passeone.style.borderColor = "red";
        passetwo.style.borderColor = "red";
    }
})

//
// Validation formulaire
//////////////////////////////
let confirmname = document.querySelector('#confirm-name')
let confirmfirstname = document.querySelector("#confirm-firstname")
let confirmmail = document.querySelector("#confirm-mail")
let confirmobject = document.querySelector("#confirm-object")
let confirmmess = document.querySelector("#confirm-mess")
let missName = document.querySelector("#missName")

let confirm = document.querySelector('#envoie').addEventListener('click', () => {
    let name = document.querySelector('#cname').value
    let firstname = document.querySelector('#cfirstname').value
    let mail = document.querySelector('#cmail').value
    let object = document.querySelector('#cobject').value
    let message = document.querySelector('#cmessage').value
    confirmname.value = name
    confirmfirstname.value = firstname
    confirmmail.value = mail
    confirmobject.value = object
    confirmmess.value = message
    if (name == "" || firstname == "" || mail == "" || object == "" || message == "") {
        $("#confirmation").modal('toggle');
    }
})