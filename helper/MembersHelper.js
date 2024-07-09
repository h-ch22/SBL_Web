import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, updateDoc, addDoc, getDocs, collection, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { MembersType } from "../models/MembersTypeModel.js";
import { MembersDataModel } from "../models/MembersDataModel.js";
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
const members = [];

const field_career = document.getElementById('field_career');

var selectedType = MembersType.PROFESSOR;
var file = null;
var isEditMode = false;
var currentHuman = null;

async function getMembers() {
    const membersRef = collection(db, "Members");
    const q = query(membersRef, orderBy("name"));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
        const degree = doc.get("degree");
        const email = doc.get('E-Mail');
        const tel = doc.get('Tel');
        const site = doc.get('Website');
        const cat = doc.get('cat');
        const dept = doc.get('dept');
        const name = doc.get('name');
        const interests = doc.get('interests');
        const profile = doc.get('profile');
        const career = doc.get('career');
        const id = doc.id;

        var category = MembersType.STUDENT;

        switch (cat) {
            case "Professor":
                category = MembersType.PROFESSOR;
                break;

            case "Researcher":
                category = MembersType.RESEARCHER;
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
                id, degree, email, tel, site == "" ? null : site, category, dept, name, interests, profile, career
            )
        );

    })

    show();
}

function visitPage(url) {
    window.location = url;
}

async function update(
    id, email, tel, website, cat, degree, dept, name, career, interests, profile
) {

    if (profile != null) {
        const storageRef = ref(storage, `members/img/${id}.png`);
        await uploadBytes(storageRef, profile).then((snapshot) => {
            profile = null;
            getDownloadURL(ref(storage, `members/img/${id}.png`)).then(async (url) => {
                const docRef = doc(db, "Members", id);

                await updateDoc(docRef, {
                    "E-Mail": email,
                    "Tel": tel,
                    "Website": website,
                    "cat": cat,
                    "dept": dept,
                    "name": name,
                    "interests": interests,
                    "profile": url,
                    "career": career,
                    "degree": degree
                }).then(function () {
                    alert('Modified successfully.');
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
            });
        }).catch((error) => {
            console.log(error);
            alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

            return false;
        });
    } else {
        const docRef = doc(db, "Members", id);

        await updateDoc(docRef, {
            "E-Mail": email,
            "Tel": tel,
            "Website": website,
            "cat": cat,
            "dept": dept,
            "name": name,
            "interests": interests,
            "career": career,
            "degree": degree
        }).then(function () {
            alert('Modified successfully.');
            return true;
        }).catch((error) => {
            console.log(error);
            alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

            return false;
        })
    }
}

async function add(
    email, tel, website, cat, degree, dept, name, career, interests, profile
) {

    const uploadData = {
        "E-Mail": email,
        "Tel": tel,
        "Website": website,
        "cat": cat,
        "dept": dept,
        "name": name,
        "career": career,
        "degree": degree,
        "interests": interests,
        "profile": null
    };

    const docRef = await addDoc(collection(db, "Members"), uploadData).catch((error) => {
        alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");
        console.log(error);
        return false;
    });

    if (profile != null) {
        const storageRef = ref(storage, `members/img/${docRef.id}.png`);
        await uploadBytes(storageRef, profile).then((snapshot) => {
            profile = null;

            getDownloadURL(ref(storage, `members/img/${docRef.id}.png`)).then(async (url) => {
                await updateDoc(doc(db, 'Members', docRef.id), { "profile": url }).then(function () {
                    alert('Uploaded successfully.')
                    return true;
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");

                    return false;
                })
            }).catch((error) => {
                console.log(error)
                alert("An error occured while upload process.\nPlease try again later, or contact to Administrator");

                return false
            })
        });
    } else {
        alert('Uploaded successfully.')

        return true;
    }
}

async function remove(id) {
    if (currentHuman.profile != null) {
        const profileRef = ref(storage, `members/img/${id}.png`);
        await deleteObject(profileRef).then(async () => {
            await deleteDoc(doc(db, "Members", id)).then(() => {
                alert('Deleted successfully')

                return true;
            }).catch((error) => {
                console.log(error);
                alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");

                return false;
            })
        }).catch((error) => {
            console.log(error);
            alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");

            return false;
        })
    } else {
        await deleteDoc(doc(db, "Members", id)).then(() => {
            alert('Deleted successfully')
            return true;
        }).catch((error) => {
            console.log(error);
            alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");

            return false;
        })
    }

}

async function checkAdminPermission() {
    const div_header = document.querySelector("#header_title");
    const pre_header_btn = document.querySelector("#header_title #btn_add");
    const modal = document.querySelector('.modal');
    const btn_add_old = document.getElementById("btn_add");
    const btn_confirm = document.getElementById("btn_confirm");
    const btn_file = document.getElementById("btn_selectFile");

    const field_email = document.getElementById("field_email");
    const field_tel = document.getElementById("field_tel");
    const field_website = document.getElementById("field_website");
    const dropdown_cat = document.getElementById("dropdown_cat");
    const dropdown_degree = document.getElementById("dropdown_degree");
    const field_dept = document.getElementById("field_dept");
    const field_name = document.getElementById("field_name");
    const field_interests = document.getElementById("field_interests");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (pre_header_btn) {
                pre_header_btn.remove();
            }

            if (btn_add_old) {
                btn_add_old.remove();
            }

            const btn_add = document.createElement("button");

            btn_add.role = "button";
            btn_add.innerHTML = "&#x2B";
            btn_add.id = "btn_add";
            btn_add.className = "addBtn";

            btn_add.addEventListener('click', function () {
                isEditMode = false;
                const txt_title = document.getElementById("txt_title");
                txt_title.innerText = 'Add new member';

                field_email.value = "";
                field_tel.value = "";
                field_website.value = "";
                dropdown_cat.value = "Student";
                dropdown_degree.value = "Undergraduate";
                field_dept.value = "";
                field_name.value = "";
                field_interests.value = "";
                field_career.value = "";

                modal.style.display = "flex";
            });

            btn_file.addEventListener('change', function (evt) {
                file = evt.target.files[0];
            })

            btn_confirm.addEventListener('click', function () {
                if (field_name.value == "" || field_dept.value == "") {
                    alert('Please write down all required fields.')
                } else {
                    if (isEditMode) {
                        update(currentHuman.id, field_email.value, field_tel.value, field_website.value, dropdown_cat.value, dropdown_degree.value, field_dept.value, field_name.value, field_career.value, field_interests.value, file);
                        isEditMode = false;
                        currentHuman = null;
                        
                        modal.style.display = "none";
                    } else {
                        add(field_email.value, field_tel.value, field_website.value, dropdown_cat.value, dropdown_degree.value, field_dept.value, field_name.value, field_career.value, field_interests.value, file);
                        modal.style.display = "none";
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

async function show() {
    const div_members = document.querySelector("#div_members");
    const pre_members_ul = document.querySelector("#div_members ul");
    const modal = document.querySelector('.modal');
    const btn_close = document.getElementById("btn_close");
    div_members.innerHTML = "";

    const field_email = document.getElementById("field_email");
    const field_tel = document.getElementById("field_tel");
    const field_website = document.getElementById("field_website");
    const dropdown_cat = document.getElementById("dropdown_cat");
    const dropdown_degree = document.getElementById("dropdown_degree");
    const field_dept = document.getElementById("field_dept");
    const field_name = document.getElementById("field_name");
    const field_interests = document.getElementById("field_interests");

    if (pre_members_ul) {
        pre_members_ul.remove();
    }

    members.forEach(function (member) {
        if (member.cat == selectedType) {
            const ul = document.createElement("ul");

            const li = document.createElement("li");
            li.id = "li_member";

            const txt_degree = document.createElement("p");
            const img = document.createElement("img");
            const txt_name = document.createElement("h1");
            const txt_email = document.createElement("h4");
            const txt_dept = document.createElement("h4");
            const txt_tel = document.createElement("h4");
            const txt_career = document.createElement("p");
            const txt_interests = document.createElement("h4");
            const btn_showCareer = document.createElement("button");

            btn_showCareer.innerText = "Show Career";
            btn_showCareer.className = "toggle_button";
            btn_showCareer.style.marginRight = "10px";
            txt_career.style.display = 'none';

            if (member.career == "" || member.career == null) {
                btn_showCareer.style.display = 'none';
                txt_career.style.display = 'none';
            }

            btn_showCareer.addEventListener('click', function () {
                if (txt_career.style.display == "none") {
                    txt_career.style.display = 'block';
                    btn_showCareer.innerText = "Hide Carrer";
                } else {
                    txt_career.style.display = 'none';
                    btn_showCareer.innerText = "Show Carrer";
                }
            });

            txt_degree.id = "txt_degree";
            txt_degree.innerText = member.degree;
            
            if(member.profile != null){
                img.src = member.profile;
            } else{
                switch(selectedType){
                    case "Student":
                        img.src = '../res/ic_student.png';
                        break;

                    default:
                        img.src = '../res/ic_graduate.png';
                        break;
                }
            }

            img.id = "img_profile";

            txt_name.innerText = member.name;
            txt_name.id = "txt_name";

            txt_email.innerText = member.email;
            txt_email.id = "txt_email";

            txt_dept.innerText = member.dept;
            txt_dept.id = "txt_dept";

            txt_tel.innerText = member.tel;
            txt_tel.id = "txt_tel";

            txt_career.innerText = member.career;
            txt_career.id = "txt_career"

            txt_interests.innerText = member.interests;
            txt_interests.id = "txt_interests"

            li.appendChild(img);
            li.appendChild(txt_name);
            
            if(member.email != "" && member.email != null){
                li.appendChild(txt_email);
            }

            li.appendChild(txt_dept);

            if (member.tel != "" && member.tel != null) {
                li.appendChild(txt_tel);
            }

            if(member.interests != "" && member.interests != null){
                li.appendChild(txt_interests)
            }

            li.appendChild(txt_degree);
            li.appendChild(txt_career);
            li.appendChild(btn_showCareer);

            if (auth.currentUser != null) {
                const btn_edit = document.createElement("button");
                btn_edit.id = "btn_edit";
                const ic_edit = document.createElement("i");
                ic_edit.className = "fa fa-edit";
                btn_edit.appendChild(ic_edit);
                btn_edit.addEventListener('click', function () {
                    currentHuman = member;
                    isEditMode = true;
                    modal.style.display = "flex";
                    const txt_title = document.getElementById("txt_title");
                    txt_title.innerText = 'Modify';

                    field_email.value = member.email;
                    field_tel.value = member.tel;
                    field_website.value = member.site;

                    switch (member.cat) {
                        case MembersType.PROFESSOR:
                            dropdown_cat.value = "Professor";
                            break;

                        case MembersType.RESEARCHER:
                            dropdown_cat.value = "Researcher";
                            break;

                        case MembersType.STUDENT:
                            dropdown_cat.value = "Student";
                            break;

                        case MembersType.ALUMNI:
                            dropdown_cat.value = "Alumni";
                            break;
                    }

                    switch (member.degree) {
                        case "Undergraduate":
                            dropdown_degree.value = "Undergraduate";
                            break;

                        case "BS":
                            dropdown_degree.value = "BS";
                            break;

                        case "MS":
                            dropdown_degree.value = "MS";
                            break;

                        case "Ph.D":
                            dropdown_degree.value = "Ph.D";
                            break;
                    }

                    field_dept.value = member.dept;
                    field_name.value = member.name;
                    field_career.value = member.career == null ? "" : member.career;
                    field_interests.value = member.interests == null ? "" : member.interests;
                });

                const btn_delete = document.createElement("button");
                btn_delete.id = "btn_delete";
                btn_delete.innerHTML = "&#x2715";
                btn_delete.addEventListener('click', function () {
                    currentHuman = member;
                    if (confirm(`Are you sure to delete ${member.name}?`)) {
                        remove(member.id);

                        currentHuman = null;
                    }
                });

                li.appendChild(btn_edit);
                li.appendChild(btn_delete);
            }

            if (member.site != null) {
                const btn_web = document.createElement("button");
                btn_web.className = "outlined_button";
                btn_web.innerText = "Visit Website";
                btn_web.role = "button";
                btn_web.onclick = visitPage.bind(null, member.site);
                li.appendChild(btn_web);
            }

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
                currentHuman = null;
            });

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

                case "btn_researcher":
                    selectedType = MembersType.RESEARCHER;
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

checkAdminPermission();
getMembers();