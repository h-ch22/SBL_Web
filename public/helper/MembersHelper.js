import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, updateDoc, addDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { MembersType } from "../models/MembersTypeModel.js";
import { DegreeType } from "../models/DegreeTypeModel.js";
import { MembersDataModel } from "../models/MembersDataModel.js";
import { getSignedIn } from "./UserManagement.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);
const members = [];

var selectedType = MembersType.PROFESSOR;
var file = null;

async function getMembers() {
    const snapshot = await getDocs(collection(db, "Members"));
    snapshot.forEach((doc) => {
        const degree = doc.get("degree");
        const email = doc.get('E-Mail');
        const tel = doc.get('Tel');
        const site = doc.get('Website');
        const cat = doc.get('cat');
        const dept = doc.get('dept');
        const name = doc.get('name');
        const profile = doc.get('profile');
        const career = doc.get('career');
        const id = doc.id;

        var category = MembersType.STUDENT;
        var deg = DegreeType.BS;

        switch (cat) {
            case "Professor":
                category = MembersType.PROFESSOR;
                break;

            case "Student":
                category = MembersType.STUDENT;
                break;

            case "Alumni":
                category = MembersType.ALUMNI;
                break;

            default:
                break;
        }

        members.push(
            new MembersDataModel(
                id, degree, email, tel, site, category, dept, name, profile, career
            )
        );

        console.log(members);
    })

    show();
}

function visitPage(url) {
    window.location = url;
}

async function update(
    id, email, tel, website, cat, degree, dept, name, career, profile
){
    var profileURL = "";

    if(profile != null){
        const storageRef = ref(storage, 'members/img');
        storageRef.put(profile).then(() => {
            storageRef.child(profile).getDownloadURL().then((downloadURL) => {
                profileURL = downloadURL; 
            })
        })

    }

    const docRef = doc(db, "Members", id);

    await updateDoc(docRef, profile == null ? {
        "E-Mail": email,
        "Tel": tel,
        "Website": website,
        "cat": cat,
        "dept": dept,
        "name": name,
        "career": career,
        "degree": degree
    } : {
        "E-Mail": email,
        "Tel": tel,
        "Website": website,
        "cat": cat,
        "dept": dept,
        "name": name,
        "profile": profileURL,
        "career": career,
        "degree": degree
    }).then(function(){
        alert('updated');
    });

    return true;
}

async function add(
    email, tel, website, cat, degree, dept, name, career, profile
){
    if(profile != null){
        const storageRef = ref(storage, 'members/img');
        uploadBytes(storageRef, profile).then((snapshot) => {
            profile = snapshot.url;
        });
    }

    const uploadData = profile == null ? {
        "E-Mail": email,
        "Tel": tel,
        "Website": website,
        "cat": cat,
        "dept": dept,
        "name": name,
        "career": career,
        "degree": degree
    } : {
        "E-Mail": email,
        "Tel": tel,
        "Website": website,
        "cat": cat,
        "dept": dept,
        "name": name,
        "profile": profile,
        "career": career,
        "degree": degree
    }

    const docRef = doc(db, "Members");

    await addDoc(docRef, uploadData);

    return true;
}

async function show() {
    const div_members = document.querySelector("#div_members");
    const pre_members_ul = document.querySelector("#div_members ul");
    const modal = document.querySelector('.modal');

    if (pre_members_ul) {
        pre_members_ul.remove();
    }

    members.forEach(function (member) {
        if (member.cat == selectedType) {
            const ul = document.createElement("ul");

            const li = document.createElement("li");
            li.id = "li_member";

            const degree = document.createElement("p");
            const img = document.createElement("img");
            const txt_name = document.createElement("h1");
            const txt_email = document.createElement("h4");
            const txt_dept = document.createElement("h4");
            const txt_tel = document.createElement("h4");

            degree.id = "txt_degree";
            degree.innerText = member.degree;

            img.src = member.profile;
            img.id = "img_profile";

            txt_name.innerText = member.name;
            txt_name.id = "txt_name";

            txt_email.innerText = member.email;
            txt_email.id = "txt_email";

            txt_dept.innerText = member.dept;
            txt_dept.id = "txt_dept";

            txt_tel.innerText = member.tel;
            txt_tel.id = "txt_tel";

            li.appendChild(img);
            li.appendChild(txt_name);
            // li.appendChild(degree);
            li.appendChild(txt_email);
            li.appendChild(txt_dept);
            li.appendChild(txt_tel);

            if (getSignedIn()) {
                const btn_edit = document.createElement("button");
                const btn_close = document.getElementById("btn_close");
                const btn_confirm = document.getElementById("btn_confirm");

                const field_email = document.getElementById("field_email");
                const field_tel = document.getElementById("field_tel");
                const field_website = document.getElementById("field_website");
                const dropdown_cat = document.getElementById("dropdown_cat");
                const dropdown_degree = document.getElementById("dropdown_degree");
                const field_dept = document.getElementById("field_dept");
                const field_name = document.getElementById("field_name");
                const field_career = document.getElementById("field_career");
                const btn_file = document.getElementById("btn_selectFile");

                btn_file.addEventListener('change', function(evt){
                    file = evt.target.files[0];
                })

                field_email.value = member.email;
                field_tel.value = member.tel;
                field_website.value = member.site;
                
                switch(member.cat){
                    case MembersType.PROFESSOR:
                        dropdown_cat.value = "Professor";
                        break;

                    case MembersType.STUDENT:
                        dropdown_cat.value = "Student";
                        break;

                    case MembersType.ALUMNI:
                        dropdown_cat.value = "Alumni";
                        break;
                }

                switch(member.deg){
                    case DegreeType.BS:
                        dropdown_degree.value = "BS";
                        break;

                    case DegreeType.MS:
                        dropdown_degree.value = "MS";
                        break;

                    case DegreeType.PhD:
                        dropdown_degree.value = "Ph.D";
                        break;
                }

                field_dept.value = member.dept;
                field_name.value = member.name;
                field_career.value = member.career == null ? "" : member.career;

                btn_edit.role = "button";
                btn_edit.innerHTML = "EDIT";
                btn_edit.className = "button-18";
                btn_edit.id = "btn_edit";

                btn_edit.addEventListener('click', function () {
                    modal.style.display = "flex";
                });

                btn_close.addEventListener('click', function(){
                    modal.style.display = "none";
                });

                btn_confirm.addEventListener('click', function(){
                    update(member.id, field_email.value, field_tel.value, field_website.value, dropdown_cat.value, dropdown_degree.value, field_dept.value, field_name.value, field_career.value, file);
                });

                li.appendChild(btn_edit);
            }

            if (member.site != null) {
                const btn_web = document.createElement("button");
                btn_web.className = "button-18";
                btn_web.innerText = "Visit Website";
                btn_web.role = "button";
                btn_web.onclick = visitPage.bind(null, member.site);
                li.appendChild(btn_web);
            }

            ul.appendChild(li);

            div_members.appendChild(ul);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    var radioButtons = document.getElementsByName("radio");

    radioButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
            switch (btn.id) {
                case "btn_professor":
                    selectedType = MembersType.PROFESSOR;
                    break;

                case "btn_students":
                    selectedType = MembersType.STUDENT;
                    break;

                case "btn_alumni":
                    selectedType = MembersType.ALUMNI;
                    break;
            }

            show();
        });
    });
})

getMembers();