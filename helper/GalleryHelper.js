import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { query, orderBy, getFirestore, doc, updateDoc, addDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

import { GalleryDataModel } from "../models/GalleryDataModel.js";

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

var datas = [];
var isEditMode = false;
var file = null;
var currentPost = null;

async function upload(title, contents){
    let today = new Date();
    const month = today.getMonth() + 1;

    const data = {
        "title": title,
        "contents": contents,
        "image": null,
        "date": `${today.getFullYear()}.${("00" + (month.toString())).slice(-2)}.${("00" + ((today.getDate()).toString())).slice(-2)} ${("00" + ((today.getHours()).toString())).slice(-2)}:${("00" + ((today.getMinutes()).toString())).slice(-2)}`
    };

    const docRef = await addDoc(collection(db, "Gallery"), data).catch((error) => {
        console.log(error);
        alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");

        return false;
    });

    if(file != null){
        const storageRef = ref(storage, `gallery/${docRef.id}/0.png`);
        await uploadBytes(storageRef, file).then((snapshot) => {
            file = null;

            getDownloadURL(ref(storage, `gallery/${docRef.id}/0.png`)).then(async (url) => {
                await updateDoc(doc(db, 'Gallery', docRef.id), {"image": url}).then(function(){
                    alert('Uploaded successfully');
                    return true;
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");

                    return false;
                })
            }).catch((error) => {
                console.log(error);
                alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");

                return false;
            })
        }).catch((error) => {
            console.log(error);
            alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");

            return false;
        });
    } else{
        alert('Uploaded successfully');

        return true;
    }
}

async function modify(id, title, contents){
    const data = {
        "title": title,
        "contents": contents
    };

    await updateDoc(doc(db, "Gallery", id), data).catch((error) => {
        alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

        console.log(error);
        return false;
    });

    isEditMode = false;
    currentPost = null;

    if(file != null){
        const storageRef = ref(storage, `gallery/${id}/0.png`);
        await uploadBytes(storageRef, file).then((snapshot) => {
            file = null;

            getDownloadURL(ref(storage, `gallery/${id}/0.png`)).then(async (url) => {
                await updateDoc(doc(db, 'Gallery', id), {"image": url}).then(function(){
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

async function remove(id){
    if (currentPost.url != null) {
        const imgRef = ref(storage, `gallery/${id}/0.png`);
        await deleteObject(imgRef).then(async () => {
            await deleteDoc(doc(db, "Gallery", id)).then(() => {
                alert('Deleted successfully.')
                currentPost = null;

                return true;
            }).catch((error) => {
                console.log(error);
                alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");
                currentPost = null;

                return false;
            })
        }).catch((error) => {
            console.log(error);
            alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");

            return false;
        })
    } else {
        await deleteDoc(doc(db, "Gallery", id)).then(() => {
            alert('Deleted successfully.')
            currentPost = null;

            return true;
        }).catch((error) => {
            console.log(error);
            alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");
            currentPost = null;

            return false;
        })
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
    const modal = document.querySelector('.modal');
    const field_title = document.getElementById("field_title");
    const field_contents = document.getElementById("field_contents");

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
        title.id = "txt_title";
        title.innerText = data.title;
        title.addEventListener('click', function(){
            location.href = `./details.html?${data.id}?gallery`;
        })
        postContainer.appendChild(title);

        const date = document.createElement("p");
        date.innerText = data.date;
        
        postContainer.appendChild(date);

        if(auth.currentUser != null){
            const btn_edit = document.createElement("button");
            btn_edit.id = "btn_edit";
            btn_edit.style.minHeight = "60px";
            const ic_edit = document.createElement("i");
            ic_edit.className = "fa fa-edit";
            btn_edit.appendChild(ic_edit);
            btn_edit.addEventListener('click', function(){
                currentPost = data;
                isEditMode = true;

                field_title.value = currentPost.title;
                field_contents.value = currentPost.contents;
                modal.style.display = "flex";

                const txt_title = document.getElementById("txt_title");
                txt_title.innerText = 'Modify';
            })
            postContainer.appendChild(btn_edit);

            const btn_delete = document.createElement("button");
            btn_delete.id = "btn_delete";
            btn_delete.innerHTML = "&#x2715";

            btn_delete.addEventListener('click', function(){
                if(confirm(`Are you sure to delete ${data.title}?`)){
                    currentPost = data;
                    remove(data.id);

                }
            })
            postContainer.appendChild(btn_delete);
        }

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
                const txt_title = document.getElementById("txt_title");
                txt_title.innerText = 'Add new photo';
                const field_title = document.getElementById("field_title");
                const field_contents = document.getElementById("field_contents");
                field_title.value = "";
                field_contents.value = "";
            });

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
                currentPost = null;
            })

            btn_confirm.addEventListener('click', function(){
                const field_title = document.getElementById("field_title");
                const field_contents = document.getElementById("field_contents");

                if(field_title.value == "" || field_contents.value == "" ){
                    alert('Please write down all fields.');
                } else if(file == null && !isEditMode){
                    alert('Please select image');
                } else{
                    progressView.style.display = "flex";

                    if(isEditMode){
                        var result = modify(currentPost.id, field_title.value, field_contents.value);
                    } else{
                        var result = upload(field_title.value, field_contents.value);
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