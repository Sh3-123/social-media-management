const axios = require('axios');

exports.generateRecommendation = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const systemMessage = `You are an expert social media manager. Generate social media content recommendations based on the topic provided by the user.

You MUST return the output STRICTLY as a JSON object with the following exact structure, without any markdown formatting or extra text:

{
  "contentIdea": "A brief description of the content idea.",
  "postText": "The actual text for the social media post.",
  "contentDirection": "Advice on story or content direction (e.g., video style, image type).",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "tips": "Tips for increasing engagement on this post."
}
`;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiOutput = response.data.choices[0].message.content;

        let parsedOutput;
        try {
            parsedOutput = JSON.parse(aiOutput);
        } catch (e) {
            console.error('Failed to parse Groq response:', aiOutput);
            return res.status(500).json({ error: 'Failed to process AI recommendation' });
        }

        res.json(parsedOutput);

    } catch (error) {
        console.error('Recommendation Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to generate recommendation',
            details: error.response?.data?.error?.message || error.message
        });
    }
};
