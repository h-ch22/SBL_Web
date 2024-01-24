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

import { CoarseDataModel } from "../models/CoarseDataModel.js";
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
var currentData = [];
var isEditMode = false;
var currentCoarse = null;

async function get(){
    const coarsesRef = collection(db, "Coarses");
    const p = query(coarsesRef, orderBy("semester"))
    const querySnapshot = await getDocs(p);

    querySnapshot.forEach((doc) => {
        currentData.push(
            new CoarseDataModel(
                doc.id, doc.get("year"), doc.get("semester"), doc.get("title"), doc.get("graduate")
            )
        );
    });

    currentData.sort(function (a, b){
        return b.year - a.year;
    })

    var lastSemester = "0";
    const oldContents = document.getElementById("coarsesContents");
    const div_coarses = document.getElementById("div_coarses");
    const modal = document.querySelector('.modal');

    if(oldContents){
        oldContents.remove();
    }

    const coarsesContents = document.createElement("div");
    coarsesContents.id = "coarsesContents";
    div_coarses.appendChild(coarsesContents);

    currentData.forEach((coarse) => {
        if(lastSemester != `${coarse.year} ${coarse.semester}`){
            lastSemester = `${coarse.year} ${coarse.semester}`;
            const title_semester = document.createElement("h2");
            title_semester.id = "title_semester";
            title_semester.innerText = lastSemester;
            coarsesContents.appendChild(title_semester);

            const hr = document.createElement("hr");
            hr.id = "div_hr";
            coarsesContents.appendChild(hr);
        }

        const div_content = document.createElement("div");
        const h3 = document.createElement("h3");
        h3.id = "coarseContents";
        h3.innerText = coarse.title;

        const div_details = document.createElement("div");
        const details = document.createElement("p");
        details.id = "coarseDetails";
        details.innerText = getGraduateType(coarse.graduate);

        div_content.id = "div_content";
        div_details.id = "div_details";

        div_content.appendChild(h3);
        div_details.appendChild(details);

        if(auth.currentUser != null){
            const btn_edit = document.createElement("button");
            const ic_edit = document.createElement("i");
            ic_edit.className = "fa fa-edit";

            btn_edit.id = "btn_edit";
            btn_edit.appendChild(ic_edit);
            btn_edit.addEventListener('click', function(){
                currentCoarse = coarse;
                isEditMode = true;
                modal.style.display = "flex";
                const field_year = document.getElementById("field_year");
                const field_title = document.getElementById("field_title");
                const dropdown_graduate = document.getElementById("dropdown_graduate");
                const dropdown_type = document.getElementById("dropdown_type");

                field_year.value = currentCoarse.year;
                field_title.value = currentCoarse.title;
                dropdown_graduate.value = currentCoarse.graduate;
                dropdown_type.value = getCode(currentCoarse.semester);
                const txt_title = document.getElementById("txt_title");
                txt_title.innerText = 'Modify';
            });

            div_content.appendChild(btn_edit);

            const btn_delete = document.createElement("button");
            btn_delete.innerHTML = "&#x2715";
            btn_delete.id = "btn_delete";
            btn_delete.addEventListener('click', function(){
                currentCoarse = coarse;

                if(confirm(`Are you sure to delete lecture (${currentCoarse.title})?`)){
                    deleteCoarse();
                }
            });

            div_content.appendChild(btn_delete);
        }

        coarsesContents.appendChild(div_content);
        coarsesContents.appendChild(div_details);
    });
}

function getType(semester){
    switch (semester) {
        case "0":
            return "Spring";

        case "1":
            return "Summer";

        case "2":
            return "Fall";

        case "3":
            return "Winter";
    }
}

function getCode(semester){
    switch(semester){
        case "Spring": return "0";
        case "Summer": return "1";
        case "Fall": return "2";
        case "Winter": return "3";
        detault:{
            alert(`Unknown type semester type ${semester} detected`);
            break;
        }
    }
}

function getGraduateType(graduate){
    switch(graduate){
        case "0": return "Undergraduate";
        case "1": return "Graduate";
    }
}

function getGraduationCode(graduate){
    switch(graduate){
        case "Undergraduate": return "0";
        case "Graduate": return "1";
    }
}

async function deleteCoarse(){
    await deleteDoc(doc(db, "Coarses", currentCoarse.id)).then(() => {
        alert("Deleted successfully");
    }).catch((_) => {
        alert("An error occured while delete process.\nPlease try again later or contact to Administrator");
    });
}

async function upload(year, semester, title, graduate) {
    const data = {
        "year": year,
        "semester": getType(semester),
        "title": title,
        "graduate": graduate
    };

    await addDoc(collection(db, "Coarses"), data).then(() => {
        alert('Coarse uploaded successfully.');
    }).catch((error) => {
        console.log(error);
        alert('An error occured while upload process.\nPlease try again later, or contact to Administrator.');
    });

}

async function modify(id, year, semester, title, graduate){
    const data = {
        "year": year,
        "semester": getType(semester),
        "title": title,
        "graduate": graduate
    };

    await updateDoc(doc(db, "Coarses", id), data).then(() => {
        alert('Coarse modified successfully.');

    }).catch((error) => {
        console.log(error)
        alert('An error occured while modify process.\nPlease try again later, or contact to Administrator.');

    });

    isEditMode = false;
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
                const txt_title = document.getElementById("txt_title");
                txt_title.innerText = 'Add new lecture';

                const field_year = document.getElementById("field_year");
                const field_title = document.getElementById("field_title");
                const dropdown_graduate = document.getElementById("dropdown_graduate");
                const dropdown_type = document.getElementById("dropdown_type");

                field_year.value = "";
                field_title.value = "";
                dropdown_graduate.value = "0";
                dropdown_type.value = "0";
            });

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
                currentCoarse = null;
            })

            btn_confirm.addEventListener('click', function(){
                const field_year = document.getElementById("field_year");
                const field_title = document.getElementById("field_title");
                const dropdown_graduate = document.getElementById("dropdown_graduate");
                const dropdown_type = document.getElementById("dropdown_type");

                if(field_year.value == "" || field_title.value == ""){
                    alert('Please write down all fields.');
                } else{
                    progressView.style.display = "flex";

                    if(isEditMode){
                        modify(currentCoarse.id, field_year.value, dropdown_type.value, field_title.value, dropdown_graduate.value);
                    } else{
                        upload(field_year.value, dropdown_type.value, field_title.value, dropdown_graduate.value);
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
    get();
    checkAdminPermission();
})
