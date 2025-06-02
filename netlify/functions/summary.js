exports.handler = async (event) => {
  const book = event.queryStringParameters.book;
  const apiKey = "YOUR_SERPAPI_KEY_HERE"; // replace with your real key

  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(book)} book&api_key=${apiKey}`;

  try {
    const response = await fetch(url); // native fetch now
    const data = await response.json();

    let summary = data.knowledge_graph?.description;
    if (!summary && data.organic_results?.length > 0) {
      summary = data.organic_results[0].snippet;
    }

    if (!summary) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No summary found." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ summary })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", details: err.message })
    };
  }
};
