import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { query, getFirestore, doc, getDocs, collection, orderBy, limit, getDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import { BannersDataModel } from "../models/BannersDataModel.js";
import { NewsDataModel } from "../models/NewsDataModel.js";
import { PublicationDataModel } from "../models/PublicationDataModel.js";

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
    const q = query(collection(db, "News"), orderBy("date", "desc"), limit(4));
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

        const div_postInfo = document.createElement('div')
        div_postInfo.className = 'div_postInfo'

        const title = document.createElement("h3");
        title.innerText = item.title;
        title.id = "txt_newsTitle";
        title.addEventListener('click', function(){
            location.href = `./details.html?${item.id}?news`;
        })
        div_postInfo.appendChild(title);

        const date = document.createElement("p");
        date.innerText = item.date;
        
        div_postInfo.appendChild(date);

        postContainer.appendChild(div_postInfo)
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
            video.style.objectFit = "contain";

            bannerDiv.appendChild(video);
            
            banners_div.appendChild(bannerDiv);

            video.addEventListener('ended', function(){
                video.currentTime = 0;
                video.play();
            });
        }
    })
}

async function getContactInfo(){
    const docRef = doc(db, "Contact", "Introduction");
    const docSnap = await getDoc(docRef);

    const btn_call = document.getElementById("btn_call");
    const btn_mail = document.getElementById("btn_mail");
    const btn_navigate = document.getElementById("btn_navigate");

    const txt_call = document.getElementById("txt_phone");
    const txt_mail = document.getElementById("txt_mail");

    var latLng = null;
    var tel = null;
    var email = null;

    if(docSnap.exists()){
        tel = docSnap.data()["tel"];
        email = docSnap.data()["email"];
        latLng = docSnap.data()["latLng"];

        if(email == null || email == ""){
            btn_mail.style.display = "none";
            txt_mail.style.display = "none";
        }else{
            txt_mail.innerText += email;
        }

        if(tel == null || tel == ""){
            btn_call.style.display = "none";
            txt_call.style.display = "none";
        } else{
            txt_call.innerText += tel;
        }
    }

    let isMobile = /Mobi/i.test(window.navigator.userAgent);

    btn_call.addEventListener('click', function(){
        if(isMobile){
            if(confirm("Connect the phone to South Korea.\nIf you are outside of South Korea, international telephone charges may be incurred depending on your carrier and plan.\nAre you sure to continue?")){
                document.location.href=`tel:${tel}`;
            } else{
                navigator.clipboard.writeText(tel).then(() => {
                    btn_call.innerText = "Copied!";
                });
            }
        } else{
            navigator.clipboard.writeText(tel).then(() => {
                btn_call.innerText = "Copied!";
            });
        }
    })

    btn_mail.addEventListener('click', function(){
        document.location.href = `mailto:${email}`
    })

    btn_navigate.addEventListener('click', function(){
        const latLng_splited = latLng.split(", ");

        document.location.href = `https://maps.google.com/?q=${latLng_splited[1]},${latLng_splited[0]}`;
    })
}

async function getPublications(){
    let publications = [];
    const div_publications = document.getElementById('div_publications');
    
    const publicationsRef = collection(db, "Publications");
    const q = query(publicationsRef, orderBy("year", "desc"), limit(5));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        publications.push(
            new PublicationDataModel(
                doc.id, doc.get("year"), doc.get("contents"), doc.get("authors") == null ? "" : doc.get("authors"), doc.get("journal") == null ? "" : doc.get("journal"), "", doc.get("link")
            )
        );
    })

    const publicationsContents = document.createElement("div");
    publicationsContents.id = "publicationsContents";
    div_publications.appendChild(publicationsContents);

    publications.forEach((paper) => {
        const div_content = document.createElement("div");
        const h6 = document.createElement("h6");
        h6.id = "paperContents";
        h6.innerText = `${paper.title}${paper.authors != "" ? ` (${paper.authors})` : ""}${paper.journalName != "" ? ` - ${paper.journalName}` : ""}`;

        div_content.id = "div_content";
        div_content.appendChild(h6);

        if(paper.url != ""){
            const newTab = document.createElement("a");
            const btn_open = document.createElement("i");
            btn_open.className = "fa fa-external-link"
            newTab.href = paper.url;
            newTab.id = "btn_openURL";
            newTab.appendChild(btn_open);
            div_content.appendChild(newTab);
        }

        publicationsContents.appendChild(div_content);
    });
}

getContactInfo();
getPublications();
getBanners();
getTopNews();