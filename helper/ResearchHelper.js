import {
    getFirestore,
    doc,
    updateDoc,
    addDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

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
var current = "Research";

function displayImages(transferedFiles){
    const imageFileList = [];
    const fileNum = transferedFiles.length;

    for(let i = 0; i < fileNum; i++){
        if(transferedFiles[i].type.match('image.*') == false){
            return;
        }

        imageFileList.push(transferedFiles[i]);
    }

    const imagePreviewArea = document.querySelector('.imageList');

    for(let file of imageFileList){
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.addEventListener('load', (event) => {
            const image = new Image();
            image.src = event.target.result;

            imagePreviewArea.insertBefore(image, imagePreviewArea.firstChild);
        })
    }
}

async function checkAdminPermission() {
    const div_header = document.querySelector("#header_title");
    const pre_header_btn = document.querySelector("#header_title button");
    const btn_close = document.getElementById("btn_close");
    const btn_confirm = document.getElementById("btn_confirm");
    
    const modal = document.querySelector('.modal');
    const progressView = document.getElementById("progressView");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (pre_header_btn) {
                pre_header_btn.remove();
            }

            const btn_add = document.createElement("button");
            btn_add.role = "button";
            btn_add.innerHTML = "&#x2B";
            btn_add.id = "btn_add";
            btn_add.className = "addBtn";

            btn_add.addEventListener('click', function () {
                modal.style.display = "flex";

                const fileZone = document.querySelector('.file_zone');
                const className = "on";

                fileZone.addEventListener('dragover', (event) => {
                    event.preventDefault();
                    fileZone.classList.add(className);
                })

                fileZone.addEventListener("dragleave", (event) => {
                    event.preventDefault();
                    fileZone.classList.remove(className);
                })

                fileZone.addEventListener('drop', (event) => {
                    event.preventDefault();
                    fileZone.classList.remove(className);

                    const transferedFiles = event.dataTransfer.files;
                    displayImages(transferedFiles);
                })
            });

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
                currentPaper = null;
            })

            btn_confirm.addEventListener('click', function(){
                const field_year = document.getElementById("field_year");
                const field_contents = document.getElementById("field_contents");
                const field_url = document.getElementById("field_url");
                const dropdown_type = document.getElementById("dropdown_type");

                if(field_year.value == "" || field_contents.value == ""){
                    alert('Please write down all fields.');
                } else{
                    progressView.style.display = "flex";

                    if(isEditMode){
                        modify(currentPaper.id, field_year.value, field_contents.value, field_url.value, dropdown_type.value);
                    } else{
                        upload(field_year.value, field_contents.value, field_url.value, dropdown_type.value);
                    }
                    progressView.style.display = "none";
                }
            });

            div_header.appendChild(btn_add);
        } else {
            if (pre_header_btn) {
                pre_header_btn.remove();
            }
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    var radioButtons = document.getElementsByName("radio");
    const txt_title = document.getElementById("txt_selectedType");

    radioButtons.forEach((btn) => {
        btn.addEventListener('click', function(){
            switch(btn.id){
                case "btn_research":
                    txt_title.innerHTML = "Research";
                    current = "Research";
                    break;

                case "btn_projects":
                    txt_title.innerHTML = "Projects";
                    current = "Projects";
                    break;
            }
        })
    })
    
    checkAdminPermission();
})