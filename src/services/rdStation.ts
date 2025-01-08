import axios from "axios";
import "dotenv/config";

const rdApi = axios.create({
  baseURL: process.env.RD_API_URL,
  headers: { Authorization: `Bearer ${process.env.RD_API_KEY}` },
});

export async function getConversations() {
  const deals: any[] = [];

  try {
    const response = await rdApi.get(
      `/deals?token=${process.env.RD_API_KEY}&limit=5`
    );

    const data = response.data.deals;

    if (!data || data.length === 0) {
      throw new Error(`No activities found`);
    }

    // Filtrar negócios com campos personalizados relevantes
    const filteredDeals = data.filter((deal: any) => {
      const customFields = deal.deal_custom_fields || [];
      return customFields.some((field: any) => {
        const label = field.custom_field?.label;
        return (
          label === "Curso de interesse ou contratado" ||
          label === "Curso de interesse"
        );
      });
    });

    deals.push(...filteredDeals);

    return deals;
  } catch (error: any) {
    console.error("Erro ao obter conversas:", error.message);
    return [];
  }
}

export async function getDealDetails(dealId: string) {
  try {
    const response = await rdApi.get(
      `/activities?token=${process.env.RD_API_KEY}&deal_id=${dealId}&type=all`
    );

    if (!response.data) {
      console.warn(`Nenhum dado retornado para o negócio ${dealId}`);
      return null;
    }

    return response.data;
  } catch (error: any) {
    console.error(
      `Erro ao obter detalhes do negócio ${dealId}:`,
      error.message
    );
    return null;
  }
}

export async function filterDealsByCustomFields(conversations: any) {
  const validDeals = conversations.filter(
    (deal: any) => deal && typeof deal.id === "string"
  );

  const uniqueDealIds = [...new Set(validDeals.map((deal: any) => deal.id))];
  console.log(
    `************** UNIQUE DEAL IDS *****************`,
    uniqueDealIds
  );

  const filteredDealIds: string[] = [];

  for (const dealId of uniqueDealIds) {
    const dealDetails = await getDealDetails(dealId as string);
    if (!dealDetails) continue;

    filteredDealIds.push(dealId as string);
  }

  return filteredDealIds;
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
