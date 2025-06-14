exports.handler = async (event) => {
  const book = event.queryStringParameters.book;
  const serpApiKey = "2f4a2c51026cecfaee418b72db691b80da14f3acc7c8b4d890de5e918c944481";

  let description = "";
  let image = "";
  let title = book;
  let authors = "Unknown Author";

  try {
    // 1. Try SerpAPI for summary
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(book)}+book+summary&api_key=${serpApiKey}`;
    const serpRes = await fetch(serpUrl);
    const serpData = await serpRes.json();

    description =
      serpData.knowledge_graph?.description ||
      serpData.organic_results?.[0]?.snippet ||
      serpData.related_questions?.[0]?.snippet ||
      "";

    // 2. If SerpAPI failed, fallback to Google Books
    if (!description || description.trim().length < 50) {
      const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book)}`;
      const gbRes = await fetch(gbUrl);
      const gbData = await gbRes.json();

      if (gbData.items?.length > 0) {
        const bookInfo = gbData.items[0].volumeInfo;
        title = bookInfo.title || title;
        authors = bookInfo.authors?.join(", ") || authors;
        description = bookInfo.description || description;
        image = bookInfo.imageLinks?.thumbnail || "";
      }
    }

    // 3. If no image from Google, fallback to SerpAPI image
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
