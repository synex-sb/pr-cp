import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
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


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


const videoGrid =
    document.getElementById("videoGrid");

const searchInput =
    document.getElementById("searchInput");


let allVideos = [];

let selectedCategory = "All";


/* ESCAPE HTML */

function escapeHTML(value = "") {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* YOUTUBE */

function getYouTubeEmbed(url) {

    try {

        const parsed = new URL(url);

        let id = "";


        if (
            parsed.hostname.includes("youtu.be")
        ) {

            id = parsed.pathname
                .split("/")
                .filter(Boolean)[0];

        }


        else if (
            parsed.hostname.includes("youtube.com")
        ) {

            id =
                parsed.searchParams.get("v");


            if (!id) {

                const parts =
                    parsed.pathname.split("/");

                const index =
                    parts.indexOf("shorts");

                if (index !== -1) {
                    id = parts[index + 1];
                }

            }


            if (!id) {

                const parts =
                    parsed.pathname.split("/");

                const index =
                    parts.indexOf("embed");

                if (index !== -1) {
                    id = parts[index + 1];
                }

            }

        }


        if (!id) {
            return null;
        }


        return `https://www.youtube.com/embed/${id}`;

    }

    catch {

        return null;

    }

}


/* DIRECT VIDEO */

function isDirectVideo(url) {

    try {

        const pathname =
            new URL(url)
                .pathname
                .toLowerCase();

        return (
            pathname.endsWith(".mp4") ||
            pathname.endsWith(".webm") ||
            pathname.endsWith(".ogg") ||
            pathname.endsWith(".mov")
        );

    }

    catch {

        return false;

    }

}


/* MEDIA */

function createMedia(video) {

    const safeUrl =
        escapeHTML(video.url);


    const youtube =
        getYouTubeEmbed(video.url);


    if (youtube) {

        return `
            <iframe
                src="${youtube}"
                title="${escapeHTML(video.title)}"
                loading="lazy"
                allow="accelerometer;
                       autoplay;
                       clipboard-write;
                       encrypted-media;
                       gyroscope;
                       picture-in-picture"
                allowfullscreen>
            </iframe>
        `;

    }


    if (isDirectVideo(video.url)) {

        return `
            <video
                controls
                preload="metadata"
                src="${safeUrl}">
            </video>
        `;

    }


    return `
        <a
            class="external-icon"
            href="${safeUrl}"
            target="_blank"
            rel="noopener noreferrer">

            ↗

        </a>
    `;

}


/* RENDER */

function renderVideos() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filtered =
        allVideos.filter(video => {

            const categoryMatch =
                selectedCategory === "All" ||
                video.category === selectedCategory;


            const text =
                (
                    video.title +
                    " " +
                    video.description +
                    " " +
                    video.category
                ).toLowerCase();


            return (
                categoryMatch &&
                text.includes(search)
            );

        });


    if (filtered.length === 0) {

        videoGrid.innerHTML = `
            <div class="empty">

                <h3>No videos found</h3>

                <p>
                    No published videos match your search.
                </p>

            </div>
        `;

        return;

    }


    videoGrid.innerHTML =
        filtered.map(video => {

            return `

                <article class="video-card">

                    <div class="video-media">

                        ${createMedia(video)}

                    </div>


                    <div class="video-info">

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


                        <p>

                            ${escapeHTML(
                                video.description || ""
                            )}

                        </p>


                        <a
                            class="open-button"
                            href="${escapeHTML(video.url)}"
                            target="_blank"
                            rel="noopener noreferrer">

                            Open Link →

                        </a>

                    </div>

                </article>

            `;

        }).join("");

}


/* LOAD FIRESTORE */

async function loadVideos() {

    try {

        const videosRef =
            collection(db, "videos");


        const videosQuery =
            query(
                videosRef,
                orderBy("createdAt", "desc")
            );


        const snapshot =
            await getDocs(videosQuery);


        allVideos =
            snapshot.docs.map(doc => {

                return {
                    id: doc.id,
                    ...doc.data()
                };

            });


        renderVideos();

    }

    catch (error) {

        console.error(error);


        videoGrid.innerHTML = `

            <div class="empty">

                <h3>
                    Unable to load videos
                </h3>

                <p>
                    Please check your Firebase Firestore setup.
                </p>

            </div>

        `;

    }

}


/* SEARCH */

searchInput.addEventListener(
    "input",
    renderVideos
);


/* CATEGORY */

document
    .querySelectorAll(".category")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".category")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                selectedCategory =
                    button.dataset.category;


                renderVideos();

            }
        );

    });


loadVideos();
