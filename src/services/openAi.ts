import "dotenv/config";
import OpenAI from "openai";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function filterConversations(conversations: any) {
  try {
    const prompt3 = `
    Dado um histórico de conversa de WhatsApp entre um consultor e um lead, analise as mensagens abaixo para identificar:
    Todos os cursos de graduação mencionados na conversa.
    O curso final de interesse do lead (se houver).
    O nome do lead (se mencionado).
    O nome do consultor (se mencionado).
    O id da deal (deal_id).
    A data e hora da última mensagem trocada na conversa.
    Atenção: "Faculdade Fama" é o nome da instituição e não deve ser identificado como um curso.
    Forneça as informações de forma organizada e clara, listando cada item separadamente. Caso algum item não possa ser identificado, informe que não foi possível encontrá-lo.
         "${JSON.stringify(conversations)}"
     Retorne um array JSON no seguinte formato:
      [
        {
          "curso": "<nome do curso de interesse ou 'Nenhum curso encontrado'>",
          "pessoa": "<nome da pessoa(lead)>",
          "consultor": "<nome do consultor>",
          "data_hora": "<data e hora da última mensagem trocada>",
          "deal_id": "<id da deal>"
        },
        ...
      ]
  `;

    const response = await openAiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt3 }],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content!;

    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("Nenhum JSON válido encontrado na resposta da IA.");
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error: any) {
    console.error("Erro ao filtrar conversa:", error.message);
    return [];
  }
}
