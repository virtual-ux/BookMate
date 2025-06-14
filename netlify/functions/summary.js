exports.handler = async (event) => {
  const book = event.queryStringParameters.book;
  const apiKey = "2f4a2c51026cecfaee418b72db691b80da14f3acc7c8b4d890de5e918c944481"; // replace with your real key

  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(book)} book&api_key=${apiKey}`;

 try {
    const response = await fetch(url);
    const data = await response.json();
    const kg = data.knowledge_graph;

    let summary = "No summary found.";
    let image = "";

    if (kg?.description) {
      summary = `
        <strong>Title:</strong> ${kg.title}<br>
        <strong>Author:</strong> ${kg.author}<br>
        <strong>Summary:</strong> ${kg.description}
      `;
      image = kg.images?.[0] || "";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ summary, image })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
