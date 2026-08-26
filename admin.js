const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";

const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const logoutBtn = document.getElementById("logoutBtn");

const videoForm = document.getElementById("videoForm");
const adminVideoList = document.getElementById("adminVideoList");

const adminSearch = document.getElementById("adminSearch");

const showPassword =
    document.getElementById("showPassword");


// Check login
function checkLogin() {

    const loggedIn =
        sessionStorage.getItem("prcpAdmin");

    if (loggedIn === "true") {

        loginPage.style.display = "none";

        adminPage.classList.add("show");

        renderVideos();

    } else {

        loginPage.style.display = "flex";

        adminPage.classList.remove("show");
    }
}


// Login
loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;


    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        sessionStorage.setItem(
            "prcpAdmin",
            "true"
        );

        loginError.textContent = "";

        checkLogin();

    } else {

        loginError.textContent =
            "Invalid username or password.";
    }

});


// Show password
showPassword.addEventListener("click", function() {

    const password =
        document.getElementById("password");

    if (password.type === "password") {

        password.type = "text";

        this.textContent = "🙈";

    } else {

        password.type = "password";

        this.textContent = "👁";
    }

});


// Logout
logoutBtn.addEventListener("click", function() {

    sessionStorage.removeItem("prcpAdmin");

    location.reload();

});


// Get videos
function getVideos() {

    return JSON.parse(
        localStorage.getItem("prcpVideos")
    ) || [];

}


// Save videos
function saveVideos(videos) {

    localStorage.setItem(
        "prcpVideos",
        JSON.stringify(videos)
    );

}


// Add video
videoForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const videos = getVideos();


    const video = {

        id: Date.now(),

        title:
            document.getElementById("title")
            .value.trim(),

        category:
            document.getElementById("category")
            .value,

        url:
            document.getElementById("videoUrl")
            .value.trim(),

        description:
            document.getElementById("description")
            .value.trim()
            ||
            "No description available."
    };


    videos.unshift(video);

    saveVideos(videos);

    videoForm.reset();

    renderVideos();

    alert("Video added successfully!");

});


// Render videos
function renderVideos() {

    const videos = getVideos();

    const search =
        adminSearch.value
        .toLowerCase()
        .trim();


    const filtered =
        videos.filter(video =>
            video.title
                .toLowerCase()
                .includes(search)
        );


    adminVideoList.innerHTML = "";


    filtered.forEach(video => {

        const item =
            document.createElement("div");

        item.className = "admin-video";

        item.innerHTML = `

            <div class="video-details">

                <span class="video-category">
                    ${escapeHTML(video.category)}
                </span>

                <h3>
                    ${escapeHTML(video.title)}
                </h3>

                <p>
                    ${escapeHTML(video.description)}
                </p>

            </div>

            <button
                class="delete-btn"
                onclick="deleteVideo(${video.id})">
                Delete
            </button>

        `;

        adminVideoList.appendChild(item);

    });


    if (filtered.length === 0) {

        adminVideoList.innerHTML = `
            <p style="color:#6b7280;padding:20px 0;">
                No videos found.
            </p>
        `;
    }


    updateStats(videos);
}


// Delete video
function deleteVideo(id) {

    if (!confirm("Delete this video?")) {
        return;
    }

    let videos = getVideos();

    videos =
        videos.filter(video =>
            video.id !== id
        );

    saveVideos(videos);

    renderVideos();
}


// Statistics
function updateStats(videos) {

    document.getElementById("totalVideos")
        .textContent = videos.length;

    document.getElementById("classVideos")
        .textContent =
        videos.filter(v =>
            v.category === "Class"
        ).length;

    document.getElementById("tutorialVideos")
        .textContent =
        videos.filter(v =>
            v.category === "Tutorial"
        ).length;
}


// Search
adminSearch.addEventListener(
    "input",
    renderVideos
);


// HTML protection
function escapeHTML(text) {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// Start
checkLogin();
