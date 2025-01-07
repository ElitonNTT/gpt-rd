import axios from "axios";
import "dotenv/config";

const rdApi = axios.create({
  baseURL: process.env.RD_API_URL,
  headers: { Authorization: `Bearer ${process.env.RD_API_KEY}` },
});
const rdApi_key = process.env.RD_API_KEY;

export async function getConversations() {
  const paginatedData: { page: number; activities: any[] }[] = [];

  try {
    for (let i = 1; i <= 2; i++) {
      console.log(
        `********************************************** Página ${i} carregada. **************************************************************`
      );
      const response = await rdApi.get(
        `/activities?token=${rdApi_key}&limit=10&page=${i}&type=all&start_date=02%2F01%2F2025&end_date=02%2F01%2F2025`
      );

      const activities = response.data.activities;

      if (activities.length === 0) {
        break;
      }

      paginatedData.push({
        page: i,
        activities,
      });
    }

    return paginatedData;
  } catch (error: any) {
    console.error("Erro ao obter conversas:", error.message);
    return [];
  }
}

export async function getDealDetails(dealId: any) {
  try {
    const response = await rdApi.get(
      `/activities?token=${rdApi_key}&deal_id=${dealId}&type=all`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Erro ao obter detalhes do negócio ${dealId}:`,
      error.message
    );
    return null;
  }
}

export async function getConversationDetails() {
  const conversations = await getConversations();

  // Combina todas as atividades de todas as páginas
  const allActivities = conversations.flatMap(
    (pageData) => pageData.activities
  );

  const uniqueDealIds = [...new Set(allActivities.map((c: any) => c.deal_id))];

  const consolidatedData = [];

  for (const dealId of uniqueDealIds) {
    const dealDetails = await getDealDetails(dealId);
    if (dealDetails) {
      const relevantConversations = allActivities.filter(
        (c: any) => c.deal_id === dealId
      );
      consolidatedData.push({
        deal_id: dealId,
        conversations: relevantConversations,
        details: dealDetails,
      });
    }
  }

  // Retorne o formato correto que a IA espera
  return consolidatedData.map((data) => ({
    deal_id: data.deal_id,
    conversations: data.conversations.map((conv: any) => ({
      text: conv.text,
      date: conv.date,
    })),
    details: data.details,
  }));
}
