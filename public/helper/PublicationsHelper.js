import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, updateDoc, addDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getSignedIn } from "./UserManagement.js";
import { PublicationDataModel } from "../models/PublicationDataModel.js";
import { JournalType } from "../models/JournalTypeModel.js";

var selectedType = JournalType.INTL_JOURNALS;

async function show(){

}

document.addEventListener('DOMContentLoaded', () => {
    var radioButtons = document.getElementsByName("radio");
    const txt_selectedType = document.getElementById("txt_selectedType");

    radioButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
            switch (btn.id) {
                case "btn_intl_journals":
                    selectedType = JournalType.INTL_JOURNALS;
                    txt_selectedType.innerText = "International Journals";

                    break;

                case "btn_intl_conferences":
                    selectedType = JournalType.INTL_CONFERENCES;
                    txt_selectedType.innerText = "International Conferences";

                    break;

                case "btn_domestic_journals":
                    selectedType = JournalType.DOMESTIC_JOURNALS;
                    txt_selectedType.innerText = "Domestic Journals";

                    break;

                case "btn_domestic_conferences":
                    selectedType = JournalType.DOMESTIC_CONFERENCES;
                    txt_selectedType.innerText = "Domestic Conferences";

                    break;
            }

        });
    });
})

show();