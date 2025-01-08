import axios from "axios";
import "dotenv/config";

const rdApi = axios.create({
  baseURL: process.env.RD_API_URL,
  headers: { Authorization: `Bearer ${process.env.RD_API_KEY}` },
});

export async function getConversations() {
  const paginatedDeals: { page: number; deals: any[] }[] = [];
  let page = 1;

  const relevantDealStageIds = [
    "627b07dce89b6c0017c572a7", //INTERGAIU
    "6716b1cdf031fa0026b5827e", // Terceiro ano
    "65a945ef2de27a0018b50dca", //INTERESSADO
  ];

  try {
    while (page <= 50) {
      console.log(`Carregando página ${page}`);
      const response = await rdApi.get(
        `/deals?token=${process.env.RD_API_KEY}&limit=200&page=${page}`
      );
      const data = response.data.deals;

      if (!data || data.length === 0) {
        break;
      }
      const filteredDeals = data.filter((deal: any) => {
        const customFields = deal.deal_custom_fields || [];
        const dealStage = deal.deal_stage?.id || "";

        const areCustomFieldsEmpty =
          Array.isArray(customFields) && customFields.length === 0;

        const isRelevantDealStage = relevantDealStageIds.includes(dealStage);

        return areCustomFieldsEmpty && isRelevantDealStage;
      });
      paginatedDeals.push({ page, deals: filteredDeals });
      page++;
    }
    return paginatedDeals;
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
  const allDeals = conversations.flatMap((pageData: any) => pageData.deals);

  const validDeals = allDeals.filter(
    (deal: any) => deal && typeof deal.id === "string"
  );

  console.log("********* VALID DEALS *******", validDeals);

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
