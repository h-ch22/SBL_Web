import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDoc, getFirestore, doc, updateDoc, addDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";

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
const db = getFirestore(app);

const img_preview_emblum = document.getElementById("img_preview_emblem");
const img_preview_symbol_traditional = document.getElementById("img_preview_symbol_traditional");
const img_preview_symbol_modern = document.getElementById("img_preview_symbol_modern");

const btn_download_PNG = document.getElementById("btn_download_PNG");
const btn_download_Ai = document.getElementById("btn_download_Ai");
const btn_download_Traditional_PNG = document.getElementById("btn_download_Traditional_PNG");
const btn_download_Traditional_Ai = document.getElementById("btn_download_Traditional_Ai");
const btn_download_Modern_PNG = document.getElementById("btn_download_Modern_PNG");
const btn_download_Modern_Ai = document.getElementById("btn_download_Modern_Ai");

async function getPreview(){
    const docRef = doc(db, "Symbols", "Preview");
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){
        const preview_emblum = docSnap.data()["Emblum"];
        const preview_modern = docSnap.data()["Modern"];
        const preview_traditional = docSnap.data()["Traditional"];

        img_preview_emblum.src = preview_emblum;
        img_preview_symbol_modern.src = preview_modern;
        img_preview_symbol_traditional.src = preview_traditional;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getPreview();

    btn_download_PNG.addEventListener('click', async function(){
        const docRef = doc(db, "Symbols", "PNG");
        const docSnap = await getDoc(docRef);
    
        if(docSnap.exists()){
            const url = docSnap.data()["All"];
            window.open(url);
        } else{
            alert("파일을 다운로드하는 중 오류가 발생했습니다.\n네트워크 상태를 확인하거나 나중에 다시 시도하십시오.");
        }
    })

    btn_download_Ai.addEventListener('click', async function(){
        const docRef = doc(db, "Symbols", "Ai");
        const docSnap = await getDoc(docRef);
    
        if(docSnap.exists()){
            const url = docSnap.data()["All"];
            window.open(url);
        } else{
            alert("파일을 다운로드하는 중 오류가 발생했습니다.\n네트워크 상태를 확인하거나 나중에 다시 시도하십시오.");
        }
    })

    btn_download_Modern_PNG.addEventListener('click', async function(){
        const docRef = doc(db, "Symbols", "PNG");
        const docSnap = await getDoc(docRef);
    
        if(docSnap.exists()){
            const url = docSnap.data()["Modern"];
            window.open(url);
        } else{
            alert("파일을 다운로드하는 중 오류가 발생했습니다.\n네트워크 상태를 확인하거나 나중에 다시 시도하십시오.");
        }
    })

    btn_download_Modern_Ai.addEventListener('click', async function(){
        const docRef = doc(db, "Symbols", "Ai");
        const docSnap = await getDoc(docRef);
    
        if(docSnap.exists()){
            const url = docSnap.data()["Modern"];
            window.open(url);
        } else{
            alert("파일을 다운로드하는 중 오류가 발생했습니다.\n네트워크 상태를 확인하거나 나중에 다시 시도하십시오.");
        }
    })

    btn_download_Traditional_PNG.addEventListener('click', async function(){
        const docRef = doc(db, "Symbols", "PNG");
        const docSnap = await getDoc(docRef);
    
        if(docSnap.exists()){
            const url = docSnap.data()["Traditional"];
            window.open(url);
        } else{
            alert("파일을 다운로드하는 중 오류가 발생했습니다.\n네트워크 상태를 확인하거나 나중에 다시 시도하십시오.");
        }
    })

    btn_download_Traditional_Ai.addEventListener('click', async function(){
        const docRef = doc(db, "Symbols", "Ai");
        const docSnap = await getDoc(docRef);
    
        if(docSnap.exists()){
            const url = docSnap.data()["Traditional"];
            window.open(url);
        } else{
            alert("파일을 다운로드하는 중 오류가 발생했습니다.\n네트워크 상태를 확인하거나 나중에 다시 시도하십시오.");
        }
    })
})