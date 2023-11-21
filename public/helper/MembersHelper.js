import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { MembersType } from "../models/MembersTypeModel.js";
import { DegreeType } from "../models/DegreeTypeModel.js";
import { MembersDataModel } from "../models/MembersDataModel.js";

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
const members = [];

async function getMembers() {
    console.log('loading');
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
                degree, email, tel, site, category, dept, name, profile
            )
        );

        console.log(members);
    })

    show();
}

function visitPage(url){
    window.location = url;
}

async function show() {
    const div_professor = document.querySelector("#div_professor");
    const pre_professor_ul = document.querySelector("#div_professor ul");

    const div_student = document.querySelector("#div_student");
    const pre_student_ul = document.querySelector("#div_student ul");

    const div_alumni = document.querySelector("#div_alumni");
    const pre_alumni_ul = document.querySelector("#div_alumni ul");

    if (pre_professor_ul) {
        pre_professor_ul.remove();
    }

    if(pre_student_ul){
        pre_student_ul.remove();
    }

    if(pre_alumni_ul){
        pre_alumni_ul.remove();
    }


    members.forEach(function (member) {
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
        li.appendChild(degree);
        li.appendChild(txt_email);
        li.appendChild(txt_dept);
        li.appendChild(txt_tel);

        if(member.site != null){
            const btn_web = document.createElement("button");
            btn_web.className = "button-18";
            btn_web.innerText = "Visit Website";
            btn_web.role = "button";
            btn_web.onclick=visitPage.bind(null, member.site);
            li.appendChild(btn_web);
        }

        ul.appendChild(li);

        switch(member.cat){
            case MembersType.PROFESSOR:
                div_professor.appendChild(ul);
                break;

            case MembersType.STUDENT:
                div_student.appendChild(ul);
                break;
        }

    });


}

getMembers();