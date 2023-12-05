import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { query, getFirestore, doc, updateDoc, addDoc, getDocs, collection, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import { BannersDataModel } from "../models/BannersDataModel.js";
import { NewsDataModel } from "../models/NewsDataModel.js";

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
const banners = [];
var news = [];

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

async function getTopNews(){
    news = [];
    const q = query(collection(db, "News"), orderBy("date", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const title = doc.get("title");
        const contents = doc.get("contents");
        const url = doc.get("image");
        const date = doc.get("date");

        news.push(
            new NewsDataModel(doc.id, title, contents, url, date)
        );
    })

    const news_div = document.getElementById("div_news");

    news.forEach((item) => {
        const postContainer = document.createElement("div");
        postContainer.className = "post-container";

        const image = document.createElement("img");
        image.src = item.url;

        if(item.url == null){
            image.style.display = "none";
        }

        postContainer.appendChild(image);

        const title = document.createElement("h3");
        title.innerText = item.title;
        title.id = "txt_newsTitle";
        title.addEventListener('click', function(){
            location.href = `./details.html?${item.id}?news`;
        })
        postContainer.appendChild(title);

        const date = document.createElement("p");
        date.innerText = item.date;
        
        postContainer.appendChild(date);

        news_div.appendChild(postContainer);
    });
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
getTopNews();