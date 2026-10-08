import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// ==================================
// FIREBASE CONFIG
// ==================================

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT.firebaseapp.com",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_PROJECT.firebasestorage.app",

  messagingSenderId: "YOUR_SENDER_ID",

  appId: "YOUR_APP_ID"

};


// Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);


// ==================================
// ELEMENTS
// ==================================

const uploadForm =
  document.getElementById("uploadForm");

const photoFile =
  document.getElementById("photoFile");

const photoTitle =
  document.getElementById("photoTitle");

const photoDescription =
  document.getElementById("photoDescription");

const photoCategory =
  document.getElementById("photoCategory");

const uploadBtn =
  document.getElementById("uploadBtn");

const uploadStatus =
  document.getElementById("uploadStatus");

const adminPhotoGrid =
  document.getElementById("adminPhotoGrid");


// ==================================
// UPLOAD PHOTO
// ==================================

uploadForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();


    const file =
      photoFile.files[0];


    if (!file) {

      alert("Please select a photo.");

      return;

    }


    // File size limit: 10 MB

    if (file.size > 10 * 1024 * 1024) {

      alert(
        "Photo must be smaller than 10 MB."
      );

      return;

    }


    uploadBtn.disabled = true;

    uploadBtn.textContent =
      "Uploading...";


    uploadStatus.innerHTML =
      "Uploading photo...";


    try {

      // Unique filename

      const fileName =
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .substring(2) +
        "_" +
        file.name;


      // Storage path

      const storageRef =
        ref(
          storage,
          `photos/${fileName}`
        );


      // Upload image

      await uploadBytes(
        storageRef,
        file
      );


      // Get image URL

      const imageUrl =
        await getDownloadURL(
          storageRef
        );


      // Save information

      await addDoc(
        collection(db, "photos"),
        {

          title:
            photoTitle.value.trim(),

          description:
            photoDescription.value.trim(),

          category:
            photoCategory.value,

          imageUrl:
            imageUrl,

          storagePath:
            `photos/${fileName}`,

          fileName:
            fileName,

          createdAt:
            serverTimestamp()

        }
      );


      uploadStatus.innerHTML =
        "✅ Photo uploaded successfully!";


      uploadForm.reset();


      loadAdminPhotos();


    } catch (error) {

      console.error(error);

      uploadStatus.innerHTML =
        "❌ Upload failed: " +
        error.message;

    }


    uploadBtn.disabled = false;

    uploadBtn.textContent =
      "Upload Photo";

  }
);


// ==================================
// LOAD ADMIN PHOTOS
// ==================================

async function loadAdminPhotos() {

  try {

    const q = query(
      collection(db, "photos"),
      orderBy("createdAt", "desc")
    );


    const snapshot =
      await getDocs(q);


    if (snapshot.empty) {

      adminPhotoGrid.innerHTML =
        "<p>No photos uploaded yet.</p>";

      return;

    }


    adminPhotoGrid.innerHTML = "";


    snapshot.forEach((document) => {

      const photo =
        document.data();


      const card =
        document.createElement("div");


      card.className =
        "admin-photo";


      card.innerHTML = `

        <img
          src="${photo.imageUrl}"
          alt="photo"
        >

        <div>

          <strong>
            ${escapeHTML(
              photo.title || "Untitled"
            )}
          </strong>

          <small>
            ${escapeHTML(
              photo.category || "Other"
            )}
          </small>

          <button
            class="delete-btn"
            data-id="${document.id}"
            data-path="${photo.storagePath || ""}"
          >
            Delete
          </button>

        </div>

      `;


      adminPhotoGrid.appendChild(card);

    });


    document
      .querySelectorAll(".delete-btn")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            deletePhoto(
              button.dataset.id,
              button.dataset.path
            );

          }
        );

      });


  } catch (error) {

    console.error(error);

    adminPhotoGrid.innerHTML =
      "Failed to load photos.";

  }

}


// ==================================
// DELETE PHOTO
// ==================================

async function deletePhoto(
  id,
  storagePath
) {

  const confirmDelete =
    confirm(
      "Delete this photo permanently?"
    );


  if (!confirmDelete) return;


  try {

    // Delete Storage file

    if (storagePath) {

      const fileRef =
        ref(
          storage,
          storagePath
        );

      await deleteObject(
        fileRef
      );

    }


    // Delete Firestore document

    await deleteDoc(
      doc(
        db,
        "photos",
        id
      )
    );


    alert(
      "Photo deleted successfully."
    );


    loadAdminPhotos();


  } catch (error) {

    console.error(error);

    alert(
      "Delete failed: " +
      error.message
    );

  }

}


// ==================================
// ESCAPE HTML
// ==================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==================================
// START
// ==================================

loadAdminPhotos();
