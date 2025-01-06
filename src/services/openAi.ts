import "dotenv/config";
import OpenAI from "openai";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function filterConversations(conversations: any) {
  const filtered = [];

  for (const conversation of conversations) {
    const prompt = `
      Identifique o curso mencionado na conversa abaixo:
      "${conversation.message}"
      Retorne no formato:
      - Curso: <nome do curso ou "Nenhum curso encontrado">
      - Pessoa: <nome da pessoa>
      - Consultor: <nome do consultor>
    `;
    try {
      const response = await openAiClient.chat.completions.create({
        model: "text-davinci-003",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
      });

      // Verifique se os dados necessários existem
      const result =
        response.choices?.[0]?.message?.content?.trim() ||
        "Nenhum curso encontrado";

      if (!result.includes("Nenhum curso encontrado")) {
        const [course, person, consultant] = parseResult(result);
        filtered.push({
          conversation,
          course,
          person,
          consultant,
        });
      }
    } catch (error: any) {
      console.error("Erro ao filtrar conversa:", error.message);
    }
  }
  return filtered;
}

function parseResult(result: string) {
  const courseMatch = result.match(/Curso: (.+)/);
  const personMatch = result.match(/Pessoa: (.+)/);
  const consultantMatch = result.match(/Consultor: (.+)/);

  const course = courseMatch ? courseMatch[1].trim() : "Desconhecido";
  const person = personMatch ? personMatch[1].trim() : "Desconhecido";
  const consultant = consultantMatch
    ? consultantMatch[1].trim()
    : "Desconhecido";

  return [course, person, consultant];
}
