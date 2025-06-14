const input = document.getElementById("book-input");
const summaryBox = document.getElementById("summary");

function searchBook() {
  const book = input.value.trim();
  if (!book) return;

  summaryBox.innerHTML = `Searching summary for "<em>${book}</em>"...`;

  fetch(`/.netlify/functions/summary?book=${encodeURIComponent(book)}`)
    .then((res) => res.json())
    .then((data) => {
      summaryBox.innerHTML = data.summary || "No summary found.";
    })
    .catch((err) => {
      console.error("Error:", err);
      summaryBox.innerHTML = "Error fetching summary.";
    });
}
