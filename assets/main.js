//Vérification password
let passeone = document.querySelector('#Password1');
let passetwo = document.querySelector('#Password2');

document.querySelector('.butt-enregistrer').addEventListener('click', () => {
    if (passeone !== passetwo) {
        passeone.style.borderColor = "red";
        passetwo.style.borderColor = "red";
    }
})

// Validation formulaire//
let confirmname = document.querySelector('#confirm-name')
let confirmfirstname = document.querySelector("#confirm-firstname")
let confirmmail = document.querySelector("#confirm-mail")
let confirmobject = document.querySelector("#confirm-object")
let confirmmess = document.querySelector("#confirm-mess")
let missName=document.querySelector("#missName")

let confirm = document.querySelector('#envoie').addEventListener('click', () => {
    let name = document.querySelector('#cname').value
    let firstname = document.querySelector('#cfirstname').value
    let mail = document.querySelector('#cmail').value
    let object = document.querySelector('#cobject').value
    let message = document.querySelector('#cmessage').value
    confirmname.value = name
    confirmfirstname.value = name
    confirmmail.value = mail
    confirmobject.value = object
    confirmmess.value = message
    if(name==""||firstname==""||mail==""||object==""||message==""){
        $("#confirmation").modal('toggle');
 } })