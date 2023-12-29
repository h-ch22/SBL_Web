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
import { ProjectDataModel } from "../models/ProjectDataModel.js";

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
var projects = [];
var currentProject = "";
var isEditMode = false;

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

async function getProjects(){
    projects = [];
    const collectionRef = collection(db, "Projects");
    const q = query(collectionRef, orderBy("beginDate", "desc"));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        projects.push(
            new ProjectDataModel(
                doc.id, doc.get("beginDate"), doc.get("endDate"), doc.get("contents"), doc.get("agency"), doc.get("budget"), doc.get("budgetUnit")
            )
        )
    });

    const oldContents = document.getElementById("researchContents");
    const div_research = document.getElementById("div_research");

    if(oldContents){
        oldContents.remove();
    }

    const researchContents = document.createElement("div");
    researchContents.id = "researchContents";
    div_research.appendChild(researchContents);

    projects.forEach((project) => {
        const div_content = document.createElement("div");
        div_content.id = "div_content";

        const txt_title = document.createElement("h4");
        txt_title.id = "projectTitle";
        txt_title.innerText = project.contents;

        const txt_period = document.createElement("h5");
        txt_period.id = "txt_period";
        txt_period.innerText = `${project.beginDate} - ${project.endDate}`;

        const txt_agency = document.createElement("p");
        txt_agency.id = "txt_agency"
        txt_agency.innerText = project.agency;

        const txt_budget = document.createElement("p");
        txt_budget.id = "txt_budget"
        txt_budget.innerText = `${Number(project.budget).toLocaleString('en-US')} ${project.budgetUnit}`;

        div_content.appendChild(txt_title);
        div_content.appendChild(txt_period);
        div_content.appendChild(txt_agency);
        div_content.appendChild(txt_budget);

        researchContents.appendChild(div_content);
    })
}

async function uploadProject(beginDate, endDate, contents, agency, budget, budgetUnit){
    var unit = "KRW";

    switch(budgetUnit){
        case "0":
            unit = "KRW";
            break;

        case "1":
            unit = "USD";
            break;
    }

    const data = {
        "beginDate": beginDate,
        "endDate": endDate,
        "contents": contents,
        "agency": agency,
        "budget": budget,
        "budgetUnit": unit
    }

    await addDoc(collection(db, "Projects"), data).then(() => {
        alert('Project uploaded successfully.');
    }).catch((error) => {
        console.log(error);
        alert('An error occured while upload process.\nPlease try again later, or contact to Administrator.');
    });
}

async function checkAdminPermission() {
    const div_header = document.querySelector("#header_title");
    const pre_header_btn = document.querySelector("#header_title button");

    const btn_close = document.getElementById("btn_close");
    const btn_close_projects = document.getElementById("btn_close_projects");

    const btn_confirm = document.getElementById("btn_confirm");
    const btn_confirm_projects = document.getElementById("btn_confirm_projects");

    const modal = document.querySelector('.modal');
    const modal_projects = document.querySelector('.modal_projects');

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
                if(current == "Research"){
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
                } else if(current == "Projects"){
                    modal_projects.style.display = "flex";
                    document.getElementById('field_date_begin').value = new Date().toISOString().substring(0, 10);
                    document.getElementById('field_date_end').value = new Date().toISOString().substring(0, 10);
                }

            });

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
                currentPaper = null;
            })

            btn_close_projects.addEventListener('click', function(){
                modal_projects.style.display = "none";
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

            btn_confirm_projects.addEventListener('click', function(){
                const field_date_begin = document.getElementById('field_date_begin');
                const field_date_end = document.getElementById("field_date_end");
                const field_contents = document.getElementById("field_contents");
                const field_agency = document.getElementById("field_agency")
                const field_budget = document.getElementById("field_budget");
                const dropdown_unit = document.getElementById("dropdown_money_unit");

                if(field_date_begin.value == "" || field_date_end.value == "" || field_contents.value == "" || field_agency.value == ""){
                    alert('Please write down all required fields.');
                } else{
                    if(isEditMode){

                    } else{
                        uploadProject(field_date_begin.value, field_date_end.value, field_contents.value, field_agency.value, field_budget.value, dropdown_unit.value);
                    }
                }
            })

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
                    getProjects();
                    break;
            }
        })
    })
    
    checkAdminPermission();
})