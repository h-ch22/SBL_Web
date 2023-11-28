import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { query, getFirestore, doc, updateDoc, addDoc, getDocs, collection, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import { BannersDataModel } from "../models/BannersDataModel.js";
import { NewsDataModel } from "../models/NewsDataModel.js";

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
        const newsItemDiv = document.createElement("div");
        newsItemDiv.style.display = "inline-block";
        newsItemDiv.style.width = "20%"; // Adjust width as needed

        newsItemDiv.style.marginRight = "20px"; // Adjust margin as needed
        newsItemDiv.id = "div_newsItem"

        const newsTitle = document.createElement("h3");
        newsTitle.textContent = item.title;

        const newsDate = document.createElement("p");
        newsDate.textContent = new Date(item.date).toLocaleDateString();

        const newsImage = document.createElement("img");
        newsImage.src = item.url;
        newsImage.style.maxWidth = "100%"; // Adjust as needed
        newsImage.style.height = "auto"; // Maintain aspect ratio

        newsItemDiv.appendChild(newsImage);
        newsItemDiv.appendChild(newsTitle);
        newsItemDiv.appendChild(newsDate);

        news_div.appendChild(newsItemDiv);
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