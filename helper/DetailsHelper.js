import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { query, orderBy, getFirestore, doc, updateDoc, addDoc, getDoc, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { AwardsDataModel } from "../models/AwardsDataModel.js";
import { GalleryDataModel } from "../models/GalleryDataModel.js";
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

var title = "";
var contents = "";
var url = "";
var date = "";
var type = "";
var id = "";
var file = null;

async function get() {
    const receivedData = location.href.split('?');
    id = receivedData[1];
    type = receivedData[2];

    switch (type) {
        case "awards":
            const awardRef = doc(db, "Awards", id);
            await getDoc(awardRef).then((document) => {
                title = document.get("title");
                contents = document.get("contents");
                url = document.get("image");
                date = document.get("date");
                set();
            }).catch((error) => {
                console.log(error);
                alert('Failed to load data.\nPlease try again later or check your network status');
            })

            break;

        case "gallery":
            const galleryRef = doc(db, "Gallery", id);
            await getDoc(galleryRef).then((document) => {
                title = document.get("title");
                contents = document.get("contents");
                url = document.get("image");
                date = document.get("date");
                set();

            }).catch((error) => {
                console.log(error);
                alert('Failed to load data.\nPlease try again later or check your network status');
            })

            break;

        case "news":
            const newsRef = doc(db, "News", id);
            await getDoc(newsRef).then((document) => {
                title = document.get("title");
                contents = document.get("contents");
                url = document.get("image");
                date = document.get("date");
                set();

            }).catch((error) => {
                console.log(error);
                alert('Failed to load data.\nPlease try again later or check your network status');
            })

            break;

        default:
            alert('Requests not found');
            break;

    }
}

function set() {
    const header_title = document.getElementById("txt_title");
    header_title.innerText = title;

    const img_contents = document.getElementById("img_contents");
    if (url == null) {
        img_contents.style.display = "none";
    } else {
        img_contents.src = url;
    }

    const txt_contents = document.getElementById("txt_contents");
    txt_contents.innerText = contents;

    const txt_date = document.getElementById("txt_date");
    txt_date.innerText = date;
}

async function modify(title, contents) {
    const data = {
        "title": title,
        "contents": contents
    };


    switch (type) {
        case "awards":
            await updateDoc(doc(db, "Awards", id), data).catch((error) => {
                alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

                console.log(error);
                return false;
            });

            break;

        case "gallery":
            await updateDoc(doc(db, "Gallery", id), data).catch((error) => {
                alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

                console.log(error);
                return false;
            });

            break;

        case "news":
            await updateDoc(doc(db, "News", id), data).catch((error) => {
                alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");

                console.log(error);
                return false;
            });

            break;

        default:
            alert('Requests not found');
            break;
    }

    if (file != null) {

        switch (type) {
            case "awards":
                await uploadBytes(ref(storage, `awards/${id}/0.png`), file).then((snapshot) => {
                    file = null;
        
                    getDownloadURL(ref(storage, `awards/${id}/0.png`)).then(async (url) => {
                        await updateDoc(doc(db, 'Awards', id), { "image": url }).then(function () {
                            alert('Modified successfully.')
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
                    })
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");
        
                    return false;
                });

                break;

            case "gallery":
                await uploadBytes(ref(storage, `gallery/${id}/0.png`), file).then((snapshot) => {
                    file = null;
        
                    getDownloadURL(ref(storage, `gallery/${id}/0.png`)).then(async (url) => {
                        await updateDoc(doc(db, 'Gallery', id), { "image": url }).then(function () {
                            alert('Modified successfully.')
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
                    })
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");
        
                    return false;
                });                
                break;

            case "news":
                await uploadBytes(ref(storage, `News/${id}/0.png`), file).then((snapshot) => {
                    file = null;
        
                    getDownloadURL(ref(storage, `News/${id}/0.png`)).then(async (url) => {
                        await updateDoc(doc(db, 'News', id), { "image": url }).then(function () {
                            alert('Modified successfully.')
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
                    })
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while modify process.\nPlease try again later, or contact to Administrator");
        
                    return false;
                });

                break;

            default:
                alert('Requests not found');
                break;
        }
    } else {
        alert('Modified successfully.')

        return true;
    }
}

async function remove(){
    if (url != "") {
        switch (type) {
            case "awards":
                await deleteObject(ref(storage, `awards/${id}/0.png`)).then(async () => {
                    await deleteDoc(doc(db, "Awards", id)).then(() => {
                        alert('Deleted successfully.')
       
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
    
                break;
    
            case "gallery":
                await deleteObject(ref(storage, `gallery/${id}/0.png`)).then(async () => {
                    await deleteDoc(doc(db, "Gallery", id)).then(() => {
                        alert('Deleted successfully.')
        
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
    
                break;
    
            case "news":
                await deleteObject(ref(storage, `News/${id}/0.png`)).then(async () => {
                    await deleteDoc(doc(db, "News", id)).then(() => {
                        alert('Deleted successfully.')
        
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

                break;
    
            default:
                alert('Requests not found');
                break;
        }
    } else {
        switch (type) {
            case "awards":
                await deleteDoc(doc(db, "Awards", id)).then(() => {
                    alert('Deleted successfully.')
    
                    return true;
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");
    
                    return false;
                })
    
                break;
    
            case "gallery":
                await deleteDoc(doc(db, "Gallery", id)).then(() => {
                    alert('Deleted successfully.')
    
                    return true;
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");
    
                    return false;
                })
    
                break;
    
            case "news":
                await deleteDoc(doc(db, "News", id)).then(() => {
                    alert('Deleted successfully.')
    
                    return true;
                }).catch((error) => {
                    console.log(error);
                    alert("An error occured while delete process.\nPlease try again later, or contact to Administrator");
    
                    return false;
                })

                break;
    
            default:
                alert('Requests not found');
                break;
        }
    }
}

async function checkAdminPermission() {
    const div_header = document.querySelector("#div_contents");
    const pre_header_btn = document.querySelector("#div_contents button");
    const btn_close = document.getElementById("btn_close");
    const btn_confirm = document.getElementById("btn_confirm");
    const modal = document.querySelector('.modal');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (pre_header_btn) {
                pre_header_btn.remove();
            }

            const btn_edit = document.createElement("button");
            btn_edit.id = "btn_edit";
            btn_edit.style.minHeight = "60px";
            const ic_edit = document.createElement("i");
            ic_edit.className = "fa fa-edit";
            btn_edit.appendChild(ic_edit);
            btn_edit.addEventListener('click', function () {
                field_title.value = title;
                field_contents.value = contents;
                modal.style.display = "flex";
            })

            div_header.appendChild(btn_edit);

            const btn_delete = document.createElement("button");
            btn_delete.id = "btn_delete";
            btn_delete.innerHTML = "&#x2715";

            btn_delete.addEventListener('click', function () {
                if (confirm(`Are you sure to delete ${title}?`)) {
                    remove();
                }
            })
            div_header.appendChild(btn_delete);

            btn_close.addEventListener('click', function () {
                modal.style.display = "none";
                isEditMode = false;
                currentPost = null;
            })

            btn_confirm.addEventListener('click', function () {
                const field_title = document.getElementById("field_title");
                const field_contents = document.getElementById("field_contents");

                if (field_title.value == "" || field_contents.value == "") {
                    alert('Please write down all fields.');
                } else {
                    progressView.style.display = "flex";
                    modify(field_title.value, field_contents.value);
                    progressView.style.display = "none";
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

document.addEventListener('DOMContentLoaded', () => {
    const btn_file = document.getElementById("btn_selectFile");
    btn_file.addEventListener('change', function (evt) {
        file = evt.target.files[0];
        console.log(file);
    })

    get();
    checkAdminPermission();
})