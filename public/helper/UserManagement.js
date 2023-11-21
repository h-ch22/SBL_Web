import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

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
var currentUser = null;


function getSignInStatus(){
    const menuList = document.querySelector("#menuList");
    const btn_signInOut = document.querySelector("#menuList #btn_signInOut");

    onAuthStateChanged(auth, (user) => {
        if(btn_signInOut){
            btn_signInOut.remove();
        }

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.id = "btn_signInOut";
        a.href = "#";

        if (user){
            currentUser = user.uid;
            a.innerText = "SIGN OUT";
        } else{
            currentUser = "";
            a.innerText = "SIGN IN";
        }

        li.appendChild(a);
        menuList.appendChild(li);
    })
}

function signIn(email, password){
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        currentUser = user.uid;
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode + errorMessage);
    });
}

getSignInStatus();
