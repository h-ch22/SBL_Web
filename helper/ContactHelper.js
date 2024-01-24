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

var contents = "";
var tel = "";
var email = "";

const editor = document.getElementById('editor');
const btnBold = document.getElementById('btn-bold');
const btnItalic = document.getElementById('btn-italic');
const btnUnderline = document.getElementById('btn-underline');
const btnStrike = document.getElementById('btn-strike');
const btnOrderedList = document.getElementById('btn-ordered-list');
const btnUnorderedList = document.getElementById('btn-unordered-list');
const btnImage = document.getElementById('btn-image');
const imageSelector = document.getElementById('img-selector');

function setStyle(style){
    document.execCommand(style);
    focusEditor();
}

function focusEditor(){
    editor.focus({preventScroll: true});
}

function checkStyle() {
    if (isStyle('bold')) {
        btnBold.classList.add('active');
    } else {
        btnBold.classList.remove('active');
    }
    if (isStyle('italic')) {
        btnItalic.classList.add('active');
    } else {
        btnItalic.classList.remove('active');
    }
    if (isStyle('underline')) {
        btnUnderline.classList.add('active');
    } else {
        btnUnderline.classList.remove('active');
    }
    if (isStyle('strikeThrough')) {
        btnStrike.classList.add('active');
    } else {
        btnStrike.classList.remove('active');
    }
    if (isStyle('insertOrderedList')) {
        btnOrderedList.classList.add('active');
    } else {
        btnOrderedList.classList.remove('active');
    }
    if (isStyle('insertUnorderedList')) {
        btnUnorderedList.classList.add('active');
    } else {
        btnUnorderedList.classList.remove('active');
    }
}

function isStyle(style) {
    return document.queryCommandState(style);
}

async function update(contents, email, tel){
    const data = {
        "contents": contents,
        "tel": tel,
        "email": email
    };

    await updateDoc(doc(db, "Contact", "Introduction"), data)
        .then(() => {
            alert('Modified successfully.')

            return true;
        }).catch((error) => {
            alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

            console.log(error);
            return false;
        })
}

async function checkAdminPermission(){
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const btn_close = document.getElementById("btn_close");
            const btn_confirm = document.getElementById("btn_confirm");
            const btn_edit = document.createElement("button");
            const ic_edit = document.createElement("i");
            const modal = document.querySelector('.modal');
            const div_text = document.querySelector("#div_text");

            ic_edit.className = "fa fa-edit";
    
            btn_edit.id = "btn_edit";
            btn_edit.appendChild(ic_edit);
            btn_edit.addEventListener('click', function(){
                const field_email = document.getElementById("field_email");
                const field_tel = document.getElementById("field_tel");
    
                field_email.value = email;
                field_tel.value = tel;
                editor.innerHTML = introductionContents.innerHTML;

                btnBold.addEventListener('click', function () {
                    setStyle('bold');
                });
            
                btnItalic.addEventListener('click', function () {
                    setStyle('italic');
                });
            
                btnUnderline.addEventListener('click', function () {
                    setStyle('underline');
                });
            
                btnStrike.addEventListener('click', function () {
                    setStyle('strikeThrough')
                });
            
                btnOrderedList.addEventListener('click', function () {
                    setStyle('insertOrderedList');
                });
            
                btnUnorderedList.addEventListener('click', function () {
                    setStyle('insertUnorderedList');
                });

                btnImage.addEventListener('click', function(){
                    imageSelector.click();
                })

                imageSelector.addEventListener('change', async function (e) {
                    const files = e.target.files;
                        
                    if(files.length > 0){
                        try {
                            const file = files[0];

                            const storageRef = ref(storage, 'contact/' + file.name);
                            await uploadBytes(storageRef, file).then((snapshot) => {
                                getDownloadURL(ref(storage, `contact/${file.name}`)).then(async (url) => {
                                    editor.focus({ preventScroll: true });
                                    document.execCommand('insertHTML', false, `<img src="${url}" alt="">`);
                                }).catch((error) => {
                                    console.log(error);
                                    alert("An error occured while image upload process.\nPlease try again later, or contact to Administrator");
                        
                                    return "";
                                })
                            }).catch((error) => {
                                console.log(error);
                                alert("An error occured while image upload process.\nPlease try again later, or contact to Administrator");
                            });
                        } catch (error) {
                            console.error('Error:', error);
                            alert("An error occured while image upload process.\nPlease try again later, or contact to Administrator");
                        }
                    }
                });

                editor.addEventListener('keydown', function () {
                    checkStyle();
                });
            
                editor.addEventListener('mousedown', function () {
                    checkStyle();
                });

                modal.style.display = "flex";
            });

            div_text.appendChild(btn_edit);

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
            })

            btn_confirm.addEventListener('click', function(){
                const field_email = document.getElementById("field_email");
                const field_tel = document.getElementById("field_tel");

                if(editor.innerHTML == "" || field_email.value == "" || field_tel.value == ""){
                    alert('Please write down all fields.');
                } else{
                    update(editor.innerHTML, field_email.value, field_tel.value);
                }
            });
        }
    })
}

async function getIntroduction() {
    const docRef = doc(db, "Contact", "Introduction");
    const docSnap = await getDoc(docRef);
    const btn_phone = document.getElementById("btn_phone");
    const btn_email = document.getElementById("btn_email");

    if(docSnap.exists()){
        contents = docSnap.data()["contents"];
        tel = docSnap.data()["tel"];
        email = docSnap.data()["email"];

        btn_email.innerHTML = `${email} &#128203`;
        btn_phone.innerHTML = `${tel} &#128203`;

        if(email == null || email == ""){
            btn_email.style.display = "none";
        }

        if(tel == null || tel == ""){
            btn_tel.style.display = "none";
        }

        const introductionContents = document.getElementById("introductionContents")
        introductionContents.innerHTML = contents == null ? "" : contents;
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

    getIntroduction();
    checkAdminPermission();

})