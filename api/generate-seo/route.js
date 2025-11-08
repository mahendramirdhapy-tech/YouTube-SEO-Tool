export async function POST(request) {
  try {
    const { model, prompt, language } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Select model
    const selectedModel = model === 'auto' ? 'deepseek/deepseek-r1' : model;

    // System prompt based on language
    const systemPrompt = language === 'Hindi' 
      ? `तुम एक YouTube SEO विशेषज्ञ हो। निम्नलिखित विषय के लिए हिंदी में YouTube SEO content generate करो:
        
JSON format में output दो:
{
  "seo_titles": "3-4 आकर्षक title, comma separated",
  "description": "वीडियो description (2-3 paragraphs)",
  "hashtags": "5-7 relevant hashtags, comma separated", 
  "keywords": "8-10 keywords, comma separated"
}

Output सिर्फ JSON होना चाहिए, कोई extra text नहीं।`
      : `You are a YouTube SEO expert. Generate YouTube SEO content for the following topic in ${language}:

Return output in this JSON format:
{
  "seo_titles": "3-4 compelling titles, comma separated",
  "description": "Video description (2-3 paragraphs)",
  "hashtags": "5-7 relevant hashtags, comma separated",
  "keywords": "8-10 keywords, comma separated"
}

Output must be only JSON, no additional text.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://you-tube-seo-tool.vercel.app',
        'X-Title': 'YouTube SEO Master'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Topic: ${prompt}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        success: true,
        content: content,
        model: selectedModel
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
