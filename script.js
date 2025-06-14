const input = document.getElementById("book-input");
const summaryBox = document.getElementById("summary");
const coverImg = document.getElementById("book-cover");

function toggleSummary() {
  const short = document.querySelector('.summary-short');
  const full = document.querySelector('.summary-full');
  const btn = document.querySelector('.read-more-btn');

  if (full.style.display === "none") {
    short.style.display = "none";
    full.style.display = "block";
    btn.textContent = "Read less";
  } else {
    short.style.display = "block";
    full.style.display = "none";
    btn.textContent = "Read more";
  }
}

function searchBook() {
  const book = input.value.trim();
  if (!book) return;

  summaryBox.innerHTML = `Searching summary for "<em>${book}</em>"...`;
  coverImg.src = "";
  coverImg.style.display = "none";

  fetch(`/.netlify/functions/summary?book=${encodeURIComponent(book)}`)
    .then((res) => res.json())
    .then((data) => {
      const maxWords = 50;
      const cleanText = data.summary.replace(/<[^>]*>/g, ''); // Strip HTML tags
      const words = cleanText.split(' ');

      if (words.length > maxWords) {
        const shortText = words.slice(0, maxWords).join(' ') + "...";
        summaryBox.innerHTML = `
          <div class="summary-short">${shortText}</div>
          <div class="summary-full" style="display: none;">${data.summary}</div>
          <button class="read-more-btn" onclick="toggleSummary()">Read more</button>
        `;
      } else {
        summaryBox.innerHTML = data.summary;
      }

      if (data.image) {
        coverImg.src = data.image;
        coverImg.alt = "Book cover";
        coverImg.style.display = "block";
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      summaryBox.innerHTML = "Error fetching summary.";
    });
}
