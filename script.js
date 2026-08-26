const videoGrid = document.getElementById("videoGrid");
const videoForm = document.getElementById("videoForm");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("videoModal");
const closeModal = document.getElementById("closeModal");

const player = document.getElementById("player");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");

let currentCategory = "All";


// Default videos
const defaultVideos = [
    {
        id: 1,
        title: "Introduction Class",
        category: "Class",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Welcome to the PR CP video platform."
    },
    {
        id: 2,
        title: "HTML Tutorial",
        category: "Tutorial",
        url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        description: "Learn the basics of HTML."
    }
];


// Load videos
let videos = JSON.parse(localStorage.getItem("prcpVideos"));

if (!videos) {
    videos = defaultVideos;
    saveVideos();
}


// Save videos
function saveVideos() {
    localStorage.setItem("prcpVideos", JSON.stringify(videos));
}


// Convert YouTube URL to embed URL
function getYouTubeEmbed(url) {

    try {

        const parsed = new URL(url);

        let videoId = "";

        if (parsed.hostname.includes("youtu.be")) {

            videoId = parsed.pathname.substring(1);

        } else if (parsed.hostname.includes("youtube.com")) {

            videoId = parsed.searchParams.get("v");

            if (!videoId && parsed.pathname.includes("/embed/")) {
                videoId = parsed.pathname.split("/embed/")[1];
            }
        }

        if (!videoId) {
            return null;
        }

        return `https://www.youtube.com/embed/${videoId}`;

    } catch {
        return null;
    }
}


// Render videos
function renderVideos() {

    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredVideos = videos.filter(video => {

        const matchesCategory =
            currentCategory === "All" ||
            video.category === currentCategory;

        const matchesSearch =
            video.title.toLowerCase().includes(searchTerm) ||
            video.description.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });


    videoGrid.innerHTML = "";


    if (filteredVideos.length === 0) {

        videoGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:60px;
                color:#6b7280;
            ">
                <h3>No videos found</h3>
                <p>Try another search or category.</p>
            </div>
        `;

        return;
    }


    filteredVideos.forEach(video => {

        const card = document.createElement("div");

        card.className = "video-card";

        card.innerHTML = `

            <div class="thumbnail"
                 onclick="openVideo(${video.id})">

                <div class="play-button">
                    ▶
                </div>

            </div>

            <div class="video-info">

                <span class="badge">
                    ${escapeHTML(video.category)}
                </span>

                <h3>
                    ${escapeHTML(video.title)}
                </h3>

                <p>
                    ${escapeHTML(video.description)}
                </p>

                <div class="card-buttons">

                    <button
                        class="watch-btn"
                        onclick="openVideo(${video.id})">
                        ▶ Watch
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteVideo(${video.id})">
                        Delete
                    </button>

                </div>

            </div>
        `;

        videoGrid.appendChild(card);
    });
}


// Open video
function openVideo(id) {

    const video = videos.find(v => v.id === id);

    if (!video) return;

    const embedUrl = getYouTubeEmbed(video.url);

    if (!embedUrl) {

        window.open(video.url, "_blank");

        return;
    }

    modalTitle.textContent = video.title;
    modalDescription.textContent = video.description;

    player.innerHTML = `
        <iframe
            src="${embedUrl}?autoplay=1"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;

    modal.classList.add("show");
}


// Close video
function closeVideo() {

    modal.classList.remove("show");

    player.innerHTML = "";
}

closeModal.addEventListener("click", closeVideo);


// Click outside modal
modal.addEventListener("click", function(event) {

    if (event.target === modal) {
        closeVideo();
    }

});


// Add video
videoForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title =
        document.getElementById("title").value.trim();

    const category =
        document.getElementById("category").value;

    const url =
        document.getElementById("videoUrl").value.trim();

    const description =
        document.getElementById("description").value.trim();


    if (!title || !url) {
        alert("Please enter title and video link.");
        return;
    }


    const newVideo = {

        id: Date.now(),

        title: title,

        category: category,

        url: url,

        description:
            description || "No description available."
    };


    videos.unshift(newVideo);

    saveVideos();

    videoForm.reset();

    renderVideos();

    alert("Video added successfully!");

    window.location.hash = "videos";
});


// Delete video
function deleteVideo(id) {

    const confirmed =
        confirm("Are you sure you want to delete this video?");

    if (!confirmed) return;

    videos = videos.filter(video => video.id !== id);

    saveVideos();

    renderVideos();
}


// Category buttons
document.querySelectorAll(".category").forEach(button => {

    button.addEventListener("click", function() {

        document
            .querySelectorAll(".category")
            .forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        currentCategory =
            this.dataset.category;

        renderVideos();
    });

});


// Search
searchInput.addEventListener("input", renderVideos);


// Prevent HTML injection
function escapeHTML(text) {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// Initial render
renderVideos();
