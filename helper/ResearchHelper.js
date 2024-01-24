import {
    getFirestore,
    doc,
    updateDoc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";

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
const storage = getStorage(app);

var current = "Research";
var projects = [];
var currentProject = "";
var isEditMode = false;

const editor = document.getElementById('editor');
const btnBold = document.getElementById('btn-bold');
const btnItalic = document.getElementById('btn-italic');
const btnUnderline = document.getElementById('btn-underline');
const btnStrike = document.getElementById('btn-strike');
const btnOrderedList = document.getElementById('btn-ordered-list');
const btnUnorderedList = document.getElementById('btn-unordered-list');
const btnImage = document.getElementById('btn-image');
const imageSelector = document.getElementById('img-selector');

async function getResearch(){
    const docRef = doc(db, "Research", "contents");
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){
        const researchArea = document.getElementById('researchContents')
        researchArea.innerHTML = docSnap.get("contents");
    }
}

async function deleteResearch(){
    await updateDoc(doc(db, "Research", "contents"), {
        "contents": ""
    }).then(() => {
        alert('Deleted successfully')

        return true;
    }).catch((error) => {
        console.log(error);
        alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");

        return false;
    })
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

        if(auth.currentUser != null){
            const btn_edit = document.createElement("button");
            btn_edit.id = "btn_edit";
            const ic_edit = document.createElement("i");
            ic_edit.className = "fa fa-edit";
            btn_edit.appendChild(ic_edit);

            btn_edit.addEventListener('click', function(){
                const modal_projects = document.querySelector('.modal_projects');

                const field_date_begin = document.getElementById('field_date_begin');
                const field_date_end = document.getElementById("field_date_end");
                const field_contents = document.getElementById("field_contents");
                const field_agency = document.getElementById("field_agency")
                const field_budget = document.getElementById("field_budget");
                const dropdown_unit = document.getElementById("dropdown_money_unit");

                currentProject = project;
                isEditMode = true;
                modal_projects.style.display = "flex";

                const txt_title = document.getElementById("txt_title_projects");
                txt_title.innerText = 'Modify';

                field_date_begin.value = project.beginDate;
                field_date_end.value = project.endDate;
                field_contents.value = project.contents;
                field_agency.value = project.agency;
                field_budget.value = project.budget;
                dropdown_unit.value = project.budgetUnit == "KRW" ? "0" : "1";
            })

            const btn_delete = document.createElement("button");
            btn_delete.id = "btn_delete";
            btn_delete.innerHTML = "&#x2715";
            btn_delete.addEventListener('click', function () {
                if (confirm(`Are you sure to delete ${project.contents}?`)) {
                    deleteProject(project.id);
                }
            });

            div_content.appendChild(btn_edit);
            div_content.appendChild(btn_delete);
        }

        researchContents.appendChild(div_content);
    })
}

function convertUnitToString(unit){
    return unit == "0" ? "KRW" : "USD";
}

async function uploadResearch(contents){
    const data = {
        "contents": contents
    }

    await setDoc(doc(db, "Research", "contents"), data).then(() => {
        alert('Uploaded successfully.');
    }).catch((error) => {
        console.log(error);
        alert('An error occured while upload process.\nPlease try again later, or contact to Administrator.');
    }) 
}

async function uploadProject(beginDate, endDate, contents, agency, budget, budgetUnit){
    var unit = convertUnitToString(budgetUnit);

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

async function modifyProject(id, beginDate, endDate, contents, agency, budget, budgetUnit){
    var unit = convertUnitToString(budgetUnit);

    const data = {
        "beginDate": beginDate,
        "endDate": endDate,
        "contents": contents,
        "agency": agency,
        "budget": budget,
        "budgetUnit": unit
    }

    await updateDoc(doc(db, "Projects", id), data).then(function(){
        alert('Modified successfully');
        return true;
    }).catch((error) => {
        console.log(error);

        alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

        return false;
    })
}

async function deleteProject(id){
    await deleteDoc(doc(db, "Projects", id)).then(() => {
        alert('Deleted successfully')

        return true;
    }).catch((error) => {
        console.log(error);
        alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");

        return false;
    })
}

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

async function checkAdminPermission() {
    const pre_header_btn = document.querySelector("#header_title button");

    const btn_close = document.getElementById("btn_close");
    const btn_close_projects = document.getElementById("btn_close_projects");

    const btn_confirm = document.getElementById("btn_confirm");
    const btn_confirm_projects = document.getElementById("btn_confirm_projects");

    const modal = document.querySelector('.modal');

    const header_modifyArea = document.getElementById("header_modifyArea");
    const btn_modify_Research = document.getElementById("btn_modifyResearch");
    const btn_deleteResearch = document.getElementById("btn_deleteResearch");
    const researchArea = document.getElementById('researchContents')

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if(current == "Research"){
                header_modifyArea.style.display = "flex";
            }

            if (pre_header_btn) {
                pre_header_btn.remove();
            }

            btn_confirm.addEventListener('click', function(){
                if(editor.value == ""){
                    alert("Please write down contents.")
                } else{
                    uploadResearch(editor.innerHTML);
                }
            })

            btn_modify_Research.addEventListener('click', function(){
                modal.style.display = "flex";

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
                            const files = e.target.files;
                        
                            if(files.length > 0){
                                try {
                                    const file = files[0];
    
                                    const storageRef = ref(storage, 'research/' + file.name);
                                    await uploadBytes(storageRef, file).then((snapshot) => {
                                        getDownloadURL(ref(storage, `research/${file.name}`)).then(async (url) => {
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
                                    // Handle error, if any
                                    console.error('Error:', error);
                                    alert("An error occured while image upload process.\nPlease try again later, or contact to Administrator");
                                }
                            }
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                });

                editor.addEventListener('keydown', function () {
                    checkStyle();
                });
            
                editor.addEventListener('mousedown', function () {
                    checkStyle();
                });

                editor.innerHTML = researchArea.innerHTML;
            })

            btn_deleteResearch.addEventListener('click', function(){
                if(confirm("Are you sure to delete project?")){
                    deleteResearch();
                }
            })

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
            })

            btn_close_projects.addEventListener('click', function(){
                isEditMode = false;
                currentProject = null;
                modal_projects.style.display = "none";
            })

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
                        var result = modifyProject(currentProject.id, field_date_begin.value, field_date_end.value, field_contents.value, field_agency.value, field_budget.value, dropdown_unit.value);
                        
                        if(result){
                            currentProject = null;
                            isEditMode = false;
                            modal_projects.style.display = "none";
                        }
                    } else{
                        uploadProject(field_date_begin.value, field_date_end.value, field_contents.value, field_agency.value, field_budget.value, dropdown_unit.value);
                    }
                }
            })

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
    const header_modifyArea = document.getElementById("header_modifyArea");
    const researchArea = document.getElementById('researchContents')
    const div_header = document.querySelector("#header_title");
    const modal_projects = document.querySelector('.modal_projects');

    radioButtons.forEach((btn) => {
        btn.addEventListener('click', function(){
            switch(btn.id){
                case "btn_research":
                    txt_title.innerHTML = "Research";
                    current = "Research";
                
                    getResearch();

                    if(auth.currentUser !== null && researchArea.innerHTML != undefined){
                        header_modifyArea.style.display = "flex";
                    }

                    break;

                case "btn_projects":
                    header_modifyArea.style.display = "none";
                    txt_title.innerHTML = "Projects";
                    current = "Projects";
                    getProjects();

                    if(auth.currentUser !== null){
                        const btn_add = document.createElement("button");
                        btn_add.role = "button";
                        btn_add.innerHTML = "&#x2B";
                        btn_add.id = "btn_add";
                        btn_add.className = "addBtn";

                        div_header.appendChild(btn_add);

                        btn_add.addEventListener('click', function () {
                
                            const field_date_begin = document.getElementById('field_date_begin');
                            const field_date_end = document.getElementById("field_date_end");
                            const field_contents = document.getElementById("field_contents");
                            const field_agency = document.getElementById("field_agency")
                            const field_budget = document.getElementById("field_budget");
                            const dropdown_unit = document.getElementById("dropdown_money_unit");
            
                            isEditMode = false;
                            currentProject = null;
                            modal_projects.style.display = "flex";
                            const txt_title = document.getElementById("txt_title_projects");
                            txt_title.innerText = 'Add new project';
            
                            field_date_begin.value = new Date().toISOString().substring(0, 10);
                            field_date_end.value = new Date().toISOString().substring(0, 10);
                            field_contents.value = "";
                            field_agency.value = "";
                            field_budget.value = "";
                            dropdown_unit.value = "0";
                        });
                    }
                    break;
            }
        })
    })

    getResearch();
    checkAdminPermission();
})