import axios from "axios";
import "dotenv/config";

const rdApi = axios.create({
  baseURL: process.env.RD_API_URL,
  headers: { Authorization: `Bearer ${process.env.RD_API_KEY}` },
});

export async function getConversations() {
  const paginatedData: { page: number; activities: any[] }[] = [];
  let page = 1;

  try {
    while (true) {
      console.log(`Carregando página ${page}...`);
      const response = await rdApi.get(
        `/activities?token=${process.env.RD_API_KEY}&limit=10&page=${page}&type=all&start_date=02%2F01%2F2025&end_date=02%2F01%2F2025`
      );

      const activities = response.data.activities;

      if (!activities || activities.length === 0) {
        break;
      }

      paginatedData.push({
        page,
        activities,
      });

      page++;
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
      `/activities?token=${process.env.RD_API_KEY}&deal_id=${dealId}&type=all`
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

  return consolidatedData.map((data) => ({
    deal_id: data.deal_id,
    conversations: data.conversations.map((conv: any) => ({
      text: conv.text,
      date: conv.date,
    })),
    details: data.details,
  }));
}

// // Envia o curso para ao RD
// export async function sendCourseToIntegrator(
//   pessoa: string,
//   curso: string,
//   consultor: string
// ) {
//   try {
//     const response = await rdApi.post(`/send-course`, {
//       pessoa,
//       curso,
//       consultor,
//     });
//     console.log(`Curso enviado para ${pessoa}: ${response.status}`);
//   } catch (error: any) {
//     console.error(`Erro ao enviar curso para ${pessoa}:`, error.message);
//   }
// }
