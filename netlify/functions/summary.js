exports.handler = async (event) => {
  const book = event.queryStringParameters.book;
  const serpApiKey = "2f4a2c51026cecfaee418b72db691b80da14f3acc7c8b4d890de5e918c944481";

  let title = book;
  let authors = "Unknown Author";
  let description = "";
  let image = "";

  try {
    // 1. Try Google Books API first
    const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(book)}`;
    const gbRes = await fetch(gbUrl);
    const gbData = await gbRes.json();

    if (gbData.items?.length > 0) {
      const bookInfo = gbData.items[0].volumeInfo;
      title = bookInfo.title || title;
      authors = bookInfo.authors?.join(", ") || authors;
      description = bookInfo.description || "";
      image = bookInfo.imageLinks?.thumbnail || "";
    }

    // 2. If description is missing or too short, try SerpAPI
    if (!description || description.trim().length < 50) {
      const serpDescUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(book)}+book+summary&api_key=${serpApiKey}`;
      const serpRes = await fetch(serpDescUrl);
      const serpData = await serpRes.json();

      description =
        serpData.knowledge_graph?.description ||
        serpData.organic_results?.[0]?.snippet ||
        serpData.related_questions?.[0]?.snippet ||
        description;
    }

    // 3. If image is missing, try SerpAPI image search
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
    // 4. Get recommendations based on genre or fallback to title
  const recQuery = `books like ${title}`;
  const recUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(recQuery)}&api_key=${serpApiKey}`;

  const recRes = await fetch(recUrl);
  const recData = await recRes.json();

  const recommendations = recData.organic_results?.slice(0, 5).map(result => ({
  title: result.title || "Untitled"
})) || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ summary: summaryHTML, image, recommendations })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", details: err.message })
    };
  }
};
