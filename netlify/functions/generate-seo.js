const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { model, prompt, language } = JSON.parse(event.body);
        
        // Your API Key - Netlify Environment Variable में set करें
        const API_KEY = process.env.OPENROUTER_API_KEY;
        
        const systemPrompt = `You are a YouTube SEO expert. Generate SEO content in ${language} for: "${prompt}"
        
        Return ONLY JSON:
        {
            "seo_titles": "Title 1, Title 2, Title 3",
            "description": "Full description here...",
            "hashtags": "#tag1, #tag2, #tag3", 
            "keywords": "keyword1, keyword2, keyword3"
        }`;
        
        const payload = {
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate YouTube SEO for: ${prompt}` }
            ],
            temperature: 0.7,
            max_tokens: 1500
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'https://your-site.netlify.app',
                'X-Title': 'YouTube SEO Master'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    content: data.choices[0].message.content
                })
            };
        } else {
            throw new Error('No content in response');
        }

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
