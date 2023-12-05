import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDoc, getFirestore, doc, updateDoc, addDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB3AXoX_7mHy4uHWxLbqDY3GBuMBamtPLQ",
    authDomain: "sbl-web.firebaseapp.com",
    projectId: "sbl-web",
    storageBucket: "sbl-web.appspot.com",
    messagingSenderId: "364712268844",
    appId: "1:364712268844:web:cbf519c500cd2cc154ad89",
    measurementId: "G-H69PSCFRZS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

var file = null;
var contents = "";
var tel = "";
var email = "";

async function checkAdminPermission(){
    const btn_close = document.getElementById("btn_close");
    const btn_confirm = document.getElementById("btn_confirm");

    const modal = document.querySelector('.modal');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
            })

            btn_confirm.addEventListener('click', function(){
                const field_contents = document.getElementById("field_contents");
                const field_email = document.getElementById("field_email");
                const field_tel = document.getElementById("field_tel");

                if(field_contents.value == "" || field_email.value == "" || field_tel.value == ""){
                    alert('Please write down all fields.');
                } else{
                    progressView.style.display = "flex";
                    update(field_contents.value, field_email.value, field_tel.value);
                    progressView.style.display = "none";
                }
            });

        } else {
            if (pre_header_btn) {
                pre_header_btn.remove();
            }
        }
    })
}

async function update(contents, email, tel){
    const data = {
        "text": contents,
        "tel": tel,
        "email": email
    };

    await updateDoc(doc(db, "Contact", "Introduction"), data).catch((error) => {
        alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

        console.log(error);
        return false;
    })

    if(file != null){
        const storageRef = ref(storage, `contact/introduction.png`);
        await uploadBytes(storageRef, file).then((snapshot) => {
            file = null;

            getDownloadURL(ref(storage, `contact/introduction.png`)).then(async (url) => {
                await updateDoc(doc(db, 'Contact', "Introduction"), {"img": url}).then(function(){
                    alert('Modified successfully.')
                    return true;
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

                    return false;
                })
            }).catch((error) => {
                console.log(error);
                alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

                return false;
            })
        }).catch((error) => {
            console.log(error);
            alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

            return false;
        });
    } else{
        alert('Modified successfully.')

        return true;
    }
}

async function getIntroduction() {
    const docRef = doc(db, "Contact", "Introduction");
    const docSnap = await getDoc(docRef);
    const btn_phone = document.getElementById("btn_phone");
    const btn_email = document.getElementById("btn_email");

    if(docSnap.exists()){
        contents = docSnap.data()["text"];
        tel = docSnap.data()["tel"];
        email = docSnap.data()["email"];
        const img = docSnap.data()["img"];

        const div_text = document.querySelector("#div_text");
        const pre_text_p = document.querySelector("#div_text p");
        const pre_text_img = document.querySelector("#div_text img");
        btn_email.innerHTML = `${email} &#128203`;
        btn_phone.innerHTML = `${tel} &#128203`;

        if(pre_text_img){
            pre_text_img.remove();
        }

        if (pre_text_p) {
            pre_text_p.remove();
        }

        if(img != null){
            const intro_img = document.createElement("img");
            intro_img.src = img;
            intro_img.id = "img_introduction";
            div_text.appendChild(intro_img);
        }

        if(email == null || email == ""){
            btn_email.style.display = "none";
        }

        if(tel == null || tel == ""){
            btn_tel.style.display = "none";
        }

        const p = document.createElement("p");
        p.id = "txt_introduction";
        p.innerText = contents;

        div_text.appendChild(p);

        if(auth.currentUser != null){
            const btn_edit = document.createElement("button");
            const ic_edit = document.createElement("i");
            const modal = document.querySelector('.modal');

            ic_edit.className = "fa fa-edit";
    
            btn_edit.id = "btn_edit";
            btn_edit.appendChild(ic_edit);
            btn_edit.addEventListener('click', function(){
                const field_contents = document.getElementById("field_contents");
                const field_email = document.getElementById("field_email");
                const field_tel = document.getElementById("field_tel");
    
                field_contents.value = contents;
                field_email.value = email;
                field_tel.value = tel;

                modal.style.display = "flex";
            });

            div_text.appendChild(btn_edit);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn_phone = document.getElementById("btn_phone");
    const btn_email = document.getElementById("btn_email");

    btn_phone.addEventListener('click', function(){
        navigator.clipboard.writeText(tel).then(() => {
            btn_phone.innerHTML = `${tel} &#x2705`;
            btn_email.innerHTML = `${email} &#128203`;
        });
    })

    btn_email.addEventListener('click', function(){
        navigator.clipboard.writeText(email).then(() => {
            btn_email.innerHTML = `${email} &#x2705`;
            btn_phone.innerHTML = `${tel} &#128203`;
        });
    })

    const btn_file = document.getElementById("btn_selectFile");
    btn_file.addEventListener('change', function (evt) {
        file = evt.target.files[0];
        console.log(file);
    })

    checkAdminPermission();
})

getIntroduction();