import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

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

function getSignInStatus() {
    const btn_signInOut = document.getElementById("btn_signInOut");
    const btn_signIn = document.getElementById("btn_signIn");
    const modal = document.querySelector('.modal');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user.uid;
            btn_signInOut.innerText = "SIGN OUT";

            btn_signInOut.addEventListener('click', function () {
                signOut(auth).then(() => {
                    currentUser = null;

                    btn_signInOut.innerText = "SIGN IN";

                }).catch((error) => {
                    alert(`Unable to sign out. error code: ${error.message} (${error.code})`);
                });
            });
        } else {
            btn_signInOut.innerText = "SIGN IN";

            btn_signInOut.addEventListener('click', function () {
                modal.style.display = "flex";
            });
        }

        btn_signIn.addEventListener('click', function () {
            const email = document.getElementById("field_email").value;
            const password = document.getElementById("field_password").value;

            if (email == "" || password == "") {
                alert('Please fill in all fields.');
            } else {
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        currentUser = user.uid;
                        
                        modal.style.display = "none";
                    
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;

                        alert(`The sign-in could not be processed : ${errorMessage} (${errorCode})`);
                    });

            }
        });
    })
}

function getSignedIn(){
    return auth.currentUser == null ? false : true;
}

getSignInStatus();

export{
    app
}