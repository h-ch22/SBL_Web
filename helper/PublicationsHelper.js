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

import { PublicationDataModel } from "../models/PublicationDataModel.js";
import { JournalType } from "../models/JournalTypeModel.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

var selectedType = JournalType.INTL_JOURNALS;

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
var currentPaper = null;

async function get(type){
    var value = "Intl_Journals";
    currentData = [];

    switch (type) {
        case "0":
            value = "Intl_Journals";
            break;

        case "1":
            value = "Intl_Conferences";
            break;

        case "2":
            value = "Domestic_Journals";
            break;

        case "3":
            value = "Domestic_Conferences";
            break;
    }


    const publicationsRef = collection(db, "Publications");
    const q = query(publicationsRef, where("type", "==", value), orderBy("year", "desc"));

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        currentData.push(
            new PublicationDataModel(
                doc.id, doc.get("year"), doc.get("contents"), doc.get("authors") == null ? "" : doc.get("authors"), doc.get("journal") == null ? "" : doc.get("journal"), value, doc.get("link")
            )
        );
    });

    var lastYear = "0";
    const oldContents = document.getElementById("publicationsContents");
    const div_publications = document.getElementById("div_publications");
    const modal = document.querySelector('.modal');

    if(oldContents){
        oldContents.remove();
    }

    const publicationsContents = document.createElement("div");
    publicationsContents.id = "publicationsContents";
    div_publications.appendChild(publicationsContents);

    currentData.forEach((paper) => {
        if(lastYear != paper.year){
            lastYear = paper.year;
            const title_year = document.createElement("h2");
            title_year.id = "title_year";
            title_year.innerText = lastYear;
            publicationsContents.appendChild(title_year);

            const hr = document.createElement("hr");
            hr.id = "div_hr";
            publicationsContents.appendChild(hr);
        }

        const div_content = document.createElement("div");
        const h4 = document.createElement("h4");
        h4.id = "paperContents";
        h4.innerText = `${paper.title}${paper.authors != "" ? ` (${paper.authors})` : ""}${paper.journalName != "" ? ` - ${paper.journalName}` : ""}`;

        div_content.id = "div_content";
        div_content.appendChild(h4);

        if(paper.url != ""){
            const newTab = document.createElement("a");
            const btn_open = document.createElement("i");
            btn_open.className = "fa fa-external-link"
            newTab.href = paper.url;
            newTab.id = "btn_openURL";
            newTab.appendChild(btn_open);
            div_content.appendChild(newTab);
        }

        if(auth.currentUser != null){
            const btn_edit = document.createElement("button");
            const ic_edit = document.createElement("i");
            ic_edit.className = "fa fa-edit";

            btn_edit.id = "btn_edit";
            btn_edit.appendChild(ic_edit);
            btn_edit.addEventListener('click', function(){
                currentPaper = paper;
                isEditMode = true;
                modal.style.display = "flex";

                const field_year = document.getElementById("field_year");
                const field_title = document.getElementById("field_title");
                const field_authors = document.getElementById("field_authors");
                const field_journal = document.getElementById("field_journal");
                const field_url = document.getElementById("field_url");
                const dropdown_type = document.getElementById("dropdown_type");

                field_year.value = currentPaper.year;
                field_title.value = currentPaper.title;
                field_authors.value = currentPaper.authors;
                field_journal.value = currentPaper.journalName;
                field_url.value = currentPaper.url;
                dropdown_type.value = type;
                const txt_title = document.getElementById("txt_title");
                txt_title.innerText = 'Modify';
            });

            div_content.appendChild(btn_edit);

            const btn_delete = document.createElement("button");
            btn_delete.innerHTML = "&#x2715";
            btn_delete.id = "btn_delete";
            btn_delete.addEventListener('click', function(){
                currentPaper = paper;

                if(confirm(`Are you sure to delete paper (${currentPaper.title})?`)){
                    deletePaper();
                }
            });

            div_content.appendChild(btn_delete);

        }

        publicationsContents.appendChild(div_content);
    });
}

async function deletePaper(){
    await deleteDoc(doc(db, "Publications", currentPaper.id)).then(() => {
        alert("Deleted successfully");
    }).catch((error) => {
        alert("An error occured while delete process.\nPlease try again later or contact to Administrator");
    });
}

async function upload(year, contents, authors, journal, link, type) {
    var docId = "Intl_Journals";

    switch (type) {
        case "0":
            docId = "Intl_Journals";
            break;

        case "1":
            docId = "Intl_Conferences";
            break;

        case "2":
            docId = "Domestic_Journals";
            break;

        case "3":
            docId = "Domestic_Conferences";
            break;
    }

    const data = {
        "contents": contents,
        "link": link,
        "year": year,
        "journal": journal,
        "authors": authors,
        "type": docId
    };

    await addDoc(collection(db, "Publications"), data).then(() => {
        alert('Paper uploaded successfully.');
    }).catch((error) => {
        console.log(error);
        alert('An error occured while upload process.\nPlease try again later, or contact to Administrator.');
    });

}

async function modify(id, year, contents, authors, journal, link, type){
    var docId = "Intl_Journals";

    switch (type) {
        case "0":
            docId = "Intl_Journals";
            break;

        case "1":
            docId = "Intl_Conferences";
            break;

        case "2":
            docId = "Domestic_Journals";
            break;

        case "3":
            docId = "Domestic_Conferences";
            break;
    }

    const data = {
        "contents": contents,
        "link": link,
        "year": year,
        "journal": journal,
        "authors": authors,
        "type": docId
    };

    await updateDoc(doc(db, "Publications", id), data).then(() => {
        alert('Paper modified successfully.');

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
                txt_title.innerText = 'Add new publication';

                const field_year = document.getElementById("field_year");
                const field_title = document.getElementById("field_title");
                const field_authors = document.getElementById("field_authors");
                const field_journal = document.getElementById("field_journal");
                const field_url = document.getElementById("field_url");
                const dropdown_type = document.getElementById("dropdown_type");

                field_year.value = "";
                field_title.value = "";
                field_authors.value = "";
                field_journal.value = "";
                field_url.value = "";
                dropdown_type.value = "0";
            });

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
                currentPaper = null;
            })

            btn_confirm.addEventListener('click', function(){
                const field_year = document.getElementById("field_year");
                const field_title = document.getElementById("field_title");
                const field_authors = document.getElementById("field_authors");
                const field_journal = document.getElementById("field_journal");
                const field_url = document.getElementById("field_url");
                const dropdown_type = document.getElementById("dropdown_type");

                if(field_year.value == "" || field_title.value == "" || field_authors.value == "" || field_journal.value == ""){
                    alert('Please write down all fields.');
                } else{
                    if(isEditMode){
                        modify(currentPaper.id, field_year.value, field_title.value, field_authors.value, field_journal.value, field_url.value, dropdown_type.value);
                    } else{
                        upload(field_year.value, field_title.value, field_authors.value, field_journal.value, field_url.value, dropdown_type.value);
                    }
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
    const txt_selectedType = document.getElementById("txt_selectedType");

    radioButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
            switch (btn.id) {
                case "btn_intl_journals":
                    selectedType = JournalType.INTL_JOURNALS;
                    txt_selectedType.innerText = "International Journals";
                    get("0");

                    break;

                case "btn_intl_conferences":
                    selectedType = JournalType.INTL_CONFERENCES;
                    txt_selectedType.innerText = "International Conferences";
                    get("1");

                    break;

                case "btn_domestic_journals":
                    selectedType = JournalType.DOMESTIC_JOURNALS;
                    txt_selectedType.innerText = "Domestic Journals";
                    get("2");

                    break;

                case "btn_domestic_conferences":
                    selectedType = JournalType.DOMESTIC_CONFERENCES;
                    txt_selectedType.innerText = "Domestic Conferences";
                    get("3");
                    break;
            }

        });

    });

    checkAdminPermission();

})

get("0");