import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT.firebaseapp.com",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_PROJECT.firebasestorage.app",

  messagingSenderId: "YOUR_SENDER_ID",

  appId: "YOUR_APP_ID"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ===============================
// PHOTO VARIABLES
// ===============================

const photoGrid =
  document.getElementById("photoGrid");

const photoSearch =
  document.getElementById("photoSearch");

let allPhotos = [];

let selectedCategory = "all";


// ===============================
// LOAD PHOTOS
// ===============================

async function loadPhotos() {

  try {

    const q = query(
      collection(db, "photos"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    allPhotos = [];

    snapshot.forEach((doc) => {

      allPhotos.push({
        id: doc.id,
        ...doc.data()
      });

    });

    displayPhotos();

  } catch (error) {

    console.error(error);

    photoGrid.innerHTML = `
      <div class="error">
        Failed to load photos.
      </div>
    `;

  }

}


// ===============================
// DISPLAY PHOTOS
// ===============================

function displayPhotos() {

  const searchText =
    photoSearch.value.toLowerCase().trim();


  const filtered = allPhotos.filter(photo => {

    const title =
      (photo.title || "").toLowerCase();

    const description =
      (photo.description || "").toLowerCase();

    const category =
      (photo.category || "").toLowerCase();


    const matchesSearch =
      title.includes(searchText) ||
      description.includes(searchText);


    const matchesCategory =
      selectedCategory === "all" ||
      category === selectedCategory;


    return matchesSearch && matchesCategory;

  });


  if (filtered.length === 0) {

    photoGrid.innerHTML = `
      <div class="empty">
        No photos found.
      </div>
    `;

    return;

  }


  photoGrid.innerHTML = filtered.map(photo => `

    <div class="photo-card">

      <div class="photo-image">

        <img
          src="${photo.imageUrl}"
          alt="${escapeHTML(photo.title || "Photo")}"
          loading="lazy"
        >

      </div>


      <div class="photo-info">

        <h3>
          ${escapeHTML(photo.title || "Untitled")}
        </h3>

        <p>
          ${escapeHTML(photo.description || "")}
        </p>

        <span class="photo-category">
          ${escapeHTML(photo.category || "Other")}
        </span>

      </div>

    </div>

  `).join("");

}


// ===============================
// SEARCH
// ===============================

photoSearch.addEventListener(
  "input",
  displayPhotos
);


// ===============================
// CATEGORY FILTER
// ===============================

document.querySelectorAll(".category")
.forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".category")
      .forEach(btn =>
        btn.classList.remove("active")
      );

    button.classList.add("active");

    selectedCategory =
      button.dataset.category;

    displayPhotos();

  });

});


// ===============================
// BASIC HTML ESCAPE
// ===============================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ===============================
// START
// ===============================

loadPhotos();
