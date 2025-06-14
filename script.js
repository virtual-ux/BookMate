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
  const fullHTML = data.summary;
  
  // Extract summary text from the full HTML
  const match = fullHTML.match(/📝 <strong>Summary:<\/strong> (.*)/s);
  const summaryText = match ? match[1] : "";

  const maxWords = 50;
  const words = summaryText.split(' ');

  if (words.length > maxWords) {
    const shortText = words.slice(0, maxWords).join(' ') + "...";
    summaryBox.innerHTML = `
      ${fullHTML.replace(summaryText, `<span class="summary-short">${shortText}</span><span class="summary-full" style="display:none;">${summaryText}</span> <button class="read-more-btn" onclick="toggleSummary()">Read more</button>`)}
    `;
  } else {
    summaryBox.innerHTML = fullHTML;
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
