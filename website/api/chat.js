// This is the serverless function that will act as a proxy
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const userPrompt = req.body.prompt;
    if (!userPrompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // This is the URL for the Google Gemma model
    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    
    // This is your secret API key, securely accessed from environment variables
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    // The data structure Google's API expects
    const payload = {
        contents: [{
            parts: [{
                text: userPrompt
            }]
        }]
    };

    try {
        const response = await fetch(GOOGLE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Google API Error:', await response.text());
            throw new Error(`Google API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the text from the complex response structure
        const botResponse = data.candidates[0].content.parts[0].text;
        
        // Send the clean text back to our front-end
        res.status(200).json({ text: botResponse });

    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ error: 'Failed to fetch response from the AI model.' });
    }
}