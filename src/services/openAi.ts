import "dotenv/config";
import OpenAI from "openai";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function filterConversations(conversations: any) {
  try {
    const prompt = `
    Identifique os cursos mencionados, o nome da pessoa e o nome do consultor nas conversas ("text") abaixo:
    "${JSON.stringify(conversations)}"
    Retorne um array JSON no seguinte formato:
    [
      {
        "curso": "<nome do curso ou 'Nenhum curso encontrado'>",
        "pessoa": "<nome da pessoa>",
        "consultor": "<nome do consultor>"
      },
      ...
    ]
  `;
    const response = await openAiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result;
  } catch (error: any) {
    console.error("Erro ao filtrar conversa:", error.message);
    return [];
  }
}
