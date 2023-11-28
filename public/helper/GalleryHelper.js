import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { query, orderBy, getFirestore, doc, updateDoc, addDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

import { GalleryDataModel } from "../models/GalleryDataModel.js";

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "***REMOVED***",
    projectId: "***REMOVED***",
    storageBucket: "***REMOVED***.appspot.com",
    messagingSenderId: "***REMOVED***",
    appId: "1:***REMOVED***:web:cbf519c500cd2cc154ad89",
    measurementId: "***REMOVED***"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

var datas = [];
var isEditMode = false;
var file = null;

async function upload(title, contents){
    let today = new Date();

    const data = {
        "title": title,
        "contents": contents,
        "image": null,
        "date": `${today.getFullYear()}.${("00" + ((today.getMonth() + 1).toString())).slice(-2)}.${("00" + ((today.getDay()).toString())).slice(-2)} ${("00" + ((today.getHours()).toString())).slice(-2)}:${("00" + ((today.getMinutes()).toString())).slice(-2)}`
    };

    const docRef = await addDoc(collection(db, "Gallery"), data).catch((error) => {
        console.log(error);
        return false;
    });

    if(file != null){
        const storageRef = ref(storage, `gallery/${docRef.id}/0.png`);
        await uploadBytes(storageRef, file).then((snapshot) => {
            file = null;

            getDownloadURL(ref(storage, `gallery/${docRef.id}/0.png`)).then(async (url) => {
                await updateDoc(doc(db, 'Gallery', docRef.id), {"image": url}).then(function(){
                    return true;
                }).catch((error) => {
                    console.log(error);
                    return false;
                })
            }).catch((error) => {
                console.log(error);
                return false;
            })
        }).catch((error) => {
            console.log(error);
            return false;
        });
    } else{
        return true;
    }
}

async function get(){
    datas = [];
    const q = query(collection(db, "Gallery"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const title = doc.get("title");
        const contents = doc.get("contents");
        const url = doc.get("image");
        const date = doc.get("date");

        datas.push(
            new GalleryDataModel(doc.id, title, contents, url, date)
        );
    })

    show();
}

async function show(){
    const div_contents = document.getElementById("galleryContents");
    div_contents.innerHTML = "";

    datas.forEach((data) => {
        const postContainer = document.createElement("div");
        postContainer.className = "post-container";

        const image = document.createElement("img");
        image.src = data.url;

        if(data.url == null){
            image.style.display = "none";
        }

        postContainer.appendChild(image);

        const title = document.createElement("h3");
        title.innerText = data.title;
        postContainer.appendChild(title);

        const date = document.createElement("p");
        date.innerText = data.date;
        postContainer.appendChild(date);

        galleryContents.appendChild(postContainer);
    })
}

async function checkAdminPermission() {
    const div_header = document.querySelector("#header_title");
    const pre_header_btn = document.querySelector("#header_title button");
    const btn_close = document.getElementById("btn_close");
    const btn_confirm = document.getElementById("btn_confirm");

    const modal = document.querySelector('.modal');

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
            });

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
            })

            btn_confirm.addEventListener('click', function(){
                const field_title = document.getElementById("field_title");
                const field_contents = document.getElementById("field_contents");

                if(field_title.value == "" || field_contents.value == ""){
                    alert('Please write down all fields.');
                } else{
                    progressView.style.display = "flex";

                    if(isEditMode){
                    } else{
                        var result = upload(field_title.value, field_contents.value);
                        if(result){
                            alert("Uploaded successfully.");
                        } else{
                            alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");
                        }
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
    const btn_file = document.getElementById("btn_selectFile");
    btn_file.addEventListener('change', function (evt) {
        file = evt.target.files[0];
        console.log(file);
    })

    checkAdminPermission();
})

get();