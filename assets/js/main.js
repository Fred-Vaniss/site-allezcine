/////////////////////////////
//
//  Bouton pour revenir au début de la page
//
///////////////////////////// 
const createbtn = document.createElement("a");
createbtn.innerHTML = "<i class='fas fa-xs fa-arrow-up'></i>"
createbtn.setAttribute('id', 'btnscroll');
document.body.appendChild(createbtn);
const btnscroll = document.getElementById("btnscroll");

//Fonction qui fait apparaitre et disparaitre le bouton en fonction du scroll
document.addEventListener('DOMContentLoaded', function () {
    window.onscroll = (() => {
        if (window.pageYOffset >= 550) {
            btnscroll.style.display = "inline";
        } else {
            btnscroll.style.display = "none";
        }
    })
});

//Au clic, on revient au début de la page
btnscroll.addEventListener('click', () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
})
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

/////////////////////////////
//
//Affiche le GDPR seulement si le GDPR check != true
//
/////////////////////////////

//seulement si le GDPR check != true
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

//login modal
const loginUser = document.getElementById('loginUser');
const loginPassword = document.getElementById('loginPassword')
document.getElementById('loginConnexion').addEventListener('click', () => {
    if (loginUser.value === "" || loginPassword.value === "") {
        alert('Veuillez remplir les champs');
    } else {
        $('#loginModal').modal('toggle')
    }
})

//sign up modal
const signupUser = document.getElementById('signupUser');
const signupEmail = document.getElementById('signupEmail');
const signupPassword1 = document.getElementById('signupPassword1');
const signupPassword2 = document.getElementById('signupPassword2');
const signupCGU = document.getElementById('signupCGU');

document.getElementById('signupRegister').addEventListener('click', () => {
    if (signupEmail.value === "" || signupUser.value === "" || signupPassword1.value === "") {
        alert('Veillez remplir les champs');
    } else if (signupCGU.checked === false) {
        alert('Il faut accepter les CGU');
    } else if (signupPassword1.value !== signupPassword2.value) {
        signupPassword1.style.borderColor = 'red';
        signupPassword2.style.borderColor = 'red';
    } else {
        signupPassword1.style.borderColor = 'gray';
        signupPassword2.style.borderColor = 'gray';
        $('#valinscrip').modal('toggle');
        $('#signupModal').modal('toggle');
    }
})

//footer form
const cname = document.getElementById('cname');
const cfirstname = document.getElementById("cfirstname");
const cmail = document.getElementById("cmail");
const cobject = document.getElementById("cobject");
const cmess = document.getElementById("cmessage");
const csubmbit = document.getElementById("csubmit");

csubmbit.addEventListener('click', () => {
    if (cname.value === '' || cfirstname.value === '' || cmail.value === '' || cobject.value === '' || cmessage.value === '') {
        alert('Veuillez remplir tous les champs');
    } else {
        document.getElementById('confirm-name').value = cname.value;
        document.getElementById('confirm-firstname').value = cfirstname.value;
        document.getElementById('confirm-mail').value = cmail.value;
        document.getElementById('confirm-object').value = cobject.value;
        document.getElementById('confirm-mess').value = cmessage.value;
        $('#confirmation').modal('toggle');
    }
})