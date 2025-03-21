const OpenAI = require('openai')

const token = process.env.GITHUB_TOKEN
const endpoint = 'https://models.inference.ai.azure.com'
const modelName = 'gpt-4o-mini'

/**
 * Generates a response from an AI model based on the provided entries, chat history, and query.
 *
 * @param {Array} entries - An array of entry objects.
 * @param {Array} chatHistory - An array of chat history objects.
 * @param {string} query - The user's query.
 * @returns {Promise<string>} - A promise that resolves to the AI-generated response text.
 */
const chat = async (entries, chatHistory, query) => {
  try {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token })

    // Format entries into a string
    const entriesString = entries
      .map((entry) => {
        return `${entry.type}: ${entry.amount} (${entry.category}) - Notes: ${
          entry.notes
        } - Date: ${entry.date.toISOString()} - CreatedAt: ${entry.createdAt.toISOString()} - UpdatedAt: ${entry.updatedAt.toISOString()}`
      })
      .join('\n')

    // Format chat history into messages
    const chatMessages = chatHistory.map((msg) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.message,
    }))

    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a financial expert. Provide detailed and accurate financial insights, advice on managing expenses and incomes, and tips for financial planning and investment strategies. Your responses should be thorough, well-researched, and tailored to individual financial situations. Use clear and concise language to explain complex financial concepts. Format your response as a single paragraph. Keep is short and concise. You are also given all of the income and expense entries of the user:\n\n${entriesString}\n\nAnd the chat history. Respond in a single, plain text paragraph without any markdown formatting or newline characters. This is really important.`,
        },
        ...chatMessages,
        { role: 'user', content: query },
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: modelName,
    })

    return response.choices[0].message.content
  } catch (error) {
    return 'And error occured when interacting with the AI model. Try again after some time.'
  }
}

module.exports = chat
