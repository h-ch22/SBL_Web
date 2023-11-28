import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, updateDoc, addDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import { BannersDataModel } from "../models/BannersDataModel.js";

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
const banners = [];

async function getBanners(){
    const snapshot = await getDocs(collection(db, "Banners"));
    snapshot.forEach((doc) => {
        const url = doc.get("url");
        const text = doc.get("text");
        const type = doc.get("type");

        banners.push(
            new BannersDataModel(
                doc.id, url, text, type
            )
        );
    });

    show();
}

function show(){
    const banners_div = document.getElementById("banners");

    banners.forEach((banner) => {
        if(banner.type == "video"){
            const video = document.createElement("video");
            video.src  = banner.url;
            video.controls = false;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            
            const bannerDiv = document.createElement("div");
            bannerDiv.style.position = "relative";
            bannerDiv.style.width = "100%";
            bannerDiv.style.height = "30%";
            bannerDiv.style.display = "flex";
            bannerDiv.style.justifyContent = "center";
            bannerDiv.style.alignItems = "center";
            video.style.maxWidth = "100%";
            video.style.maxHeight = "30%";
            video.style.objectFit = "contain"; // Adjust as needed (cover, fill, contain, etc.)

            bannerDiv.appendChild(video);
            
            banners_div.appendChild(bannerDiv);

            video.addEventListener('ended', function(){
                video.currentTime = 0;
                video.play();
            });
        }
    })
}

getBanners();