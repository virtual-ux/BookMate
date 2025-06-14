exports.handler = async (event) => {
  const book = event.queryStringParameters.book;
  const serpApiKey = "2f4a2c51026cecfaee418b72db691b80da14f3acc7c8b4d890de5e918c944481";


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
    let description = bookInfo.description || "No summary available.";

    if (!description || description.trim().length < 10) {
  const serpTextUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(book)}+book+summary&api_key=${serpApiKey}`;
  const serpRes = await fetch(serpTextUrl);
  const serpData = await serpRes.json();

  // Try to extract from knowledge_graph or organic_results
  description =
    serpData.knowledge_graph?.description ||
    serpData.organic_results?.[0]?.snippet ||
    serpData.related_questions?.[0]?.snippet ||
    "No summary available.";
}

    let image = bookInfo.imageLinks?.thumbnail || "";

    if (!image) {
  const serpImgUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(book)}+book+cover&tbm=isch&api_key=${serpApiKey}`;
  const serpImgRes = await fetch(serpImgUrl);
  const serpImgData = await serpImgRes.json();

  image = serpImgData.images_results?.[0]?.thumbnail || "";
}


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

