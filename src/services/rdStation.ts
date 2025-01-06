import axios from "axios";
import "dotenv/config";

const rdApi = axios.create({
  baseURL: process.env.RD_API_URL,
  headers: { Authorization: `Bearer ${process.env.RD_API_KEY}` },
});
const rdApi_key = process.env.RD_API_KEY;

export async function getConversations() {
  try {
    const response = await rdApi.get(
      `/activities?token=${rdApi_key}&page=1&limit=7&type=all&start_date=01%2F01%2F2025&end_date=03%2F01%2F2025`
    );
    return response.data.activities;
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

  // Filtra apenas os deal_id únicos
  const uniqueDealIds = [...new Set(conversations.map((c: any) => c.deal_id))];

  const consolidatedData = [];

  for (const dealId of uniqueDealIds) {
    const dealDetails = await getDealDetails(dealId);
    if (dealDetails) {
      const relevantConversations = conversations.filter(
        (c: any) => c.deal_id === dealId
      );
      consolidatedData.push({
        deal_id: dealId,
        conversations: relevantConversations,
        details: dealDetails,
      });
    }
  }

  return consolidatedData;
}
