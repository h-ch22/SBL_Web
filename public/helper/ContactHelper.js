import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

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

async function getIntroduction() {
    const docRef = doc(db, "Contact", "Introduction");
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){
        const text = docSnap.data()["text"];
        const img = docSnap.data()["img"];

        const div_text = document.querySelector("#div_text");
        const pre_text_p = document.querySelector("#div_text p");
        const pre_text_img = document.querySelector("#div_text img");

        if(pre_text_img){
            pre_text_img.remove();
        }

        if (pre_text_p) {
            pre_text_p.remove();
        }

        if(img != null){
            const intro_img = document.createElement("img");
            intro_img.src = img;
            intro_img.id = "img_introduction";
            div_text.appendChild(intro_img);
        }

        const p = document.createElement("p");
        p.id = "txt_introduction";
        p.innerHTML = text;

        div_text.appendChild(p);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn_phone = document.getElementById("btn_phone");
    const btn_email = document.getElementById("btn_email");

    btn_phone.addEventListener('click', function(){
        navigator.clipboard.writeText("+82-10-0000-0000").then(() => {
            btn_phone.innerHTML = "+82-10-0000-0000 &#x2705";
            btn_email.innerHTML = "tsgo@jbnu.ac.kr &#128203";
        });
    })

    btn_email.addEventListener('click', function(){
        navigator.clipboard.writeText("tsgo@jbnu.ac.kr").then(() => {
            btn_email.innerHTML = "tsgo@jbnu.ac.kr &#x2705";
            btn_phone.innerHTML = "+82-10-0000-0000 &#128203";
        });
    })
})

getIntroduction();