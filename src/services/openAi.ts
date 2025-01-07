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
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content!;

    // Extraia o JSON utilizando regex para evitar erros de parsing
    const jsonMatch = content.match(/\[.*\]/s); // Regex para encontrar um array JSON
    if (!jsonMatch) {
      throw new Error("Nenhum JSON válido encontrado na resposta da IA.");
    }

    const result = JSON.parse(jsonMatch[0]); // Parse apenas o JSON encontrado
    return result;
  } catch (error: any) {
    console.error("Erro ao filtrar conversa:", error.message);
    return [];
  }
}
