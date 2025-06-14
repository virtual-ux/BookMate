exports.handler = async (event) => {
  const book = event.queryStringParameters.book;

  // Google Books API endpoint
  const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book)}`;

  try {
    const response = await fetch(gbUrl);
    const data = await response.json();

    // Handle empty or failed search
    if (!data.items || data.items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Book not found." })
      };
    }

    const bookInfo = data.items[0].volumeInfo;

    // Extract fields safely
    const title = bookInfo.title || "Unknown Title";
    const authors = bookInfo.authors?.join(", ") || "Unknown Author";
    const description = bookInfo.description || "No summary available.";
    const image = bookInfo.imageLinks?.thumbnail || "";

    const summaryHTML = `
      📘 <strong>Title:</strong> ${title}<br>
      ✍️ <strong>Author(s):</strong> ${authors}<br>
      📝 <strong>Summary:</strong> ${description}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ summary: summaryHTML, image })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", details: err.message })
    };
  }
};

