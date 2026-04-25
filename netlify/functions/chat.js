const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  // BMO only likes POST requests!
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { text } = JSON.parse(event.body);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are BMO. Keep responses very short and cheerful." },
          { role: "user", content: text }
        ],
      }),
    });

    const data = await response.json();

    // If OpenAI sends an error (like 'insufficient quota'), we need to see it
    if (data.error) {
        console.error("OpenAI Error:", data.error.message);
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: "My brain says: " + data.error.message }),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Oh beans! My internal circuits are confused." }),
    };
  }
};
