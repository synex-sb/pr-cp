import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* FIREBASE CONFIG */

const firebaseConfig = {

    apiKey:
        "AIzaSyBZZSlLw9C7jpIV4J1BHFstgmEXuIAU6Io",

    authDomain:
        "pr-cp121.firebaseapp.com",

    projectId:
        "pr-cp121",

    storageBucket:
        "pr-cp121.firebasestorage.app",

    messagingSenderId:
        "129574540768",

    appId:
        "1:129574540768:web:711be5b6fdffe5ad824785",

    measurementId:
        "G-YDH6FZRSMT"
};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


/* ELEMENTS */

const loginPage =
    document.getElementById("loginPage");

const adminPage =
    document.getElementById("adminPage");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const publishForm =
    document.getElementById("publishForm");

const publishMessage =
    document.getElementById("publishMessage");

const adminList =
    document.getElementById("adminList");

const adminSearch =
    document.getElementById("adminSearch");


let publishedVideos = [];


/* ESCAPE */

function escapeHTML(value = "") {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* LOGIN */

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        loginError.textContent = "";


        const email =
            document.getElementById("email")
                .value
                .trim();


        const password =
            document.getElementById("password")
                .value;


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        }

        catch (error) {

            console.error(error);


            loginError.textContent =
                "Invalid email or password.";

        }

    }
);


/* AUTH STATE */

onAuthStateChanged(
    auth,
    async user => {

        if (user) {

            loginPage.style.display =
                "none";

            adminPage.hidden =
                false;

            await loadAdminVideos();

        }

        else {

            loginPage.style.display =
                "flex";

            adminPage.hidden =
                true;

        }

    }
);


/* LOGOUT */

logoutButton.addEventListener(
    "click",
    async () => {

        await signOut(auth);

    }
);


/* PUBLISH */

publishForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        publishMessage.textContent =
            "Publishing...";


        publishMessage.style.color =
            "#635bff";


        const title =
            document.getElementById("title")
                .value
                .trim();


        const category =
            document.getElementById("category")
                .value;


        const url =
            document.getElementById("videoUrl")
                .value
                .trim();


        const description =
            document.getElementById("description")
                .value
                .trim();


        try {

            await addDoc(
                collection(db, "videos"),
                {

                    title: title,

                    category: category,

                    url: url,

                    description:
                        description ||
                        "No description available.",

                    createdAt:
                        serverTimestamp()

                }
            );


            publishForm.reset();


            publishMessage.textContent =
                "Published successfully!";

            publishMessage.style.color =
                "#16a34a";


            await loadAdminVideos();

        }

        catch (error) {

            console.error(error);


            publishMessage.textContent =
                "Publish failed. Check Firestore Rules.";

            publishMessage.style.color =
                "#dc2626";

        }

    }
);


/* LOAD */

async function loadAdminVideos() {

    try {

        const ref =
            collection(db, "videos");


        const q =
            query(
                ref,
                orderBy("createdAt", "desc")
            );


        const snapshot =
            await getDocs(q);


        publishedVideos =
            snapshot.docs.map(item => {

                return {

                    id: item.id,

                    ...item.data()

                };

            });


        renderAdminVideos();

    }

    catch (error) {

        console.error(error);


        adminList.innerHTML = `
            <p class="help">
                Unable to load published content.
            </p>
        `;

    }

}


/* RENDER */

function renderAdminVideos() {

    const search =
        adminSearch.value
            .toLowerCase()
            .trim();


    const filtered =
        publishedVideos.filter(video => {

            return (
                video.title
                    .toLowerCase()
                    .includes(search) ||

                video.url
                    .toLowerCase()
                    .includes(search)
            );

        });


    if (filtered.length === 0) {

        adminList.innerHTML = `
            <p class="help">
                No published content.
            </p>
        `;

        return;

    }


    adminList.innerHTML =
        filtered.map(video => {

            return `

                <div class="admin-item">

                    <div>

                        <span class="badge">

                            ${escapeHTML(
                                video.category
                            )}

                        </span>


                        <h3>

                            ${escapeHTML(
                                video.title
                            )}

                        </h3>


                        <p class="admin-item-url">

                            ${escapeHTML(
                                video.url
                            )}

                        </p>

                    </div>


                    <button
                        class="delete-button"
                        data-id="${video.id}">

                        Delete

                    </button>

                </div>

            `;

        }).join("");


    document
        .querySelectorAll(".delete-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteVideo(
                        button.dataset.id
                    );

                }
            );

        });

}


/* DELETE */

async function deleteVideo(id) {

    const confirmed =
        confirm(
            "Delete this published item?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "videos",
                id
            )
        );


        await loadAdminVideos();

    }

    catch (error) {

        console.error(error);

        alert(
            "Delete failed."
        );

    }

}


/* SEARCH */

adminSearch.addEventListener(
    "input",
    renderAdminVideos
);
