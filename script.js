async function searchBook() {
    const input = document.getElementById("book-input").value.trim();
    if (!input) return;

    document.getElementById("summary").textContent = `Searching for "${input}"...`;

    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history.unshift(input);
    history = [...new Set(history)].slice(0, 5);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    updateRecentSearches();

    try {
        const response = await fetch(`/.netlify/functions/summary?book=${encodeURIComponent(input)}`);
        const data = await response.json();

        if (data.summary) {
            document.getElementById("summary").textContent = data.summary;
        } else {
            document.getElementById("summary").textContent = "No summary found.";
        }

        const fakeRecs = [`${input} Extended`, `Beyond ${input}`, `More like ${input}`];
        document.getElementById("recommendations").innerHTML = fakeRecs.map(book => `<li>${book}</li>`).join("");

    } catch (err) {
        console.error("Function error:", err);
        document.getElementById("summary").textContent = "Error fetching summary.";
    }
}

function openGoogle() {
    const book = document.getElementById("book-input").value.trim();
    if (book) window.open(`https://www.google.com/search?q=${encodeURIComponent(book)}+free+pdf+download`);
}

function openYouTube(type) {
    const book = document.getElementById("book-input").value.trim();
    let query = type === "audiobook" ? `${book} full audiobook` : `${book} summary`;
    if (book) window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
}

function updateRecentSearches() {
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    document.getElementById("recent-searches").innerHTML = history.map(book => `<li>${book}</li>`).join("");
}

window.onload = updateRecentSearches;
