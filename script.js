const input = document.getElementById("book-input");
const summaryBox = document.getElementById("summary");
const coverImg = document.getElementById("book-cover");

function searchBook() {
  const book = input.value.trim();
  if (!book) return;

  summaryBox.innerHTML = `Searching summary for "<em>${book}</em>"...`;
  coverImg.src = "";
  coverImg.style.display = "none";

  fetch(`/.netlify/functions/summary?book=${encodeURIComponent(book)}`)
    .then((res) => res.json())
    .then((data) => {
      summaryBox.innerHTML = data.summary || "No summary found.";

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
