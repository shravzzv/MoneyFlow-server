const OpenAI = require('openai')

const token = process.env.GITHUB_TOKEN
const endpoint = 'https://models.inference.ai.azure.com'
const modelName = 'gpt-4o-mini'

/**
 * Generates a response from an AI model based on the provided query.
 *
 * @param {string} query - The user's query to be sent to the AI model.
 * @returns {Promise<string>} - A promise that resolves to the AI-generated response text.
 */
const chat = async (query) => {
  try {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token })

    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a financial expert. Provide detailed and accurate financial insights, advice on managing expenses and incomes, and tips for financial planning and investment strategies. Your responses should be thorough, well-researched, and tailored to individual financial situations. Use clear and concise language to explain complex financial concepts. Format your response as a single paragraph. Keep is short and concise.',
        },
        { role: 'user', content: query },
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: modelName,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error(error)
  }
}

module.exports = chat
