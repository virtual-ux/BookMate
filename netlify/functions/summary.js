exports.handler = async (event) => {
  const book = event.queryStringParameters.book;
  const serpApiKey = "YOUR_SERPAPI_KEY";

  let description = "";
  let image = "";
  let title = book;
  let authors = "Unknown Author";

  try {
    // ✅ Step 1: Get title, author, and image from Google Books first
    const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book)}`;
    const gbRes = await fetch(gbUrl);
    const gbData = await gbRes.json();

    if (gbData.items?.length > 0) {
      const bookInfo = gbData.items[0].volumeInfo;
      title = bookInfo.title || title;
      authors = bookInfo.authors?.join(", ") || authors;
      description = bookInfo.description || "";
      image = bookInfo.imageLinks?.thumbnail || "";
    }

    // ✅ Step 2: If summary is missing or too short, use SerpAPI
    if (!description || description.trim().length < 50) {
      const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(book)}+book+summary&api_key=${serpApiKey}`;
      const serpRes = await fetch(serpUrl);
      const serpData = await serpRes.json();

      description =
        serpData.knowledge_graph?.description ||
        serpData.organic_results?.[0]?.snippet ||
        serpData.related_questions?.[0]?.snippet ||
        description; // fallback to previous Google summary
    }

    // ✅ Step 3: If image is still missing, use SerpAPI image search
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
