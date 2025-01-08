import {
  getConversations,
  filterDealsByCustomFields,
  getDealDetails,
} from "./services/rdStation";
import { createCsv, createExcel } from "./services/fileWriter";
import { filterConversations } from "./services/openAi";

async function main() {
  console.log("Carregando IDs de conversas...");
  const conversations = await getConversations();

  console.log("Filtrando negócios por campos customizados...");
  const filteredDealIds = await filterDealsByCustomFields(conversations);

  console.log("Iniciando processamento de cada deal filtrado...");
  for (const dealId of filteredDealIds) {
    console.log(`Processando deal: ${dealId}`);

    const dealDetails = await getDealDetails(dealId);
    if (!dealDetails) {
      console.warn(`Nenhum detalhe encontrado para deal: ${dealId}`);
      continue;
    }

    const relevantConversations = conversations.filter(
      (c) => c.deal_id === dealId
    );

    const formattedConversations = relevantConversations.map((conv) => ({
      text: conv.text,
      date: conv.date,
    }));

    const filtered = await filterConversations([
      {
        deal_id: dealId,
        conversations: formattedConversations,
        details: dealDetails,
      },
    ]);
    console.log(`Filtragem concluída para deal: ${dealId}`, filtered);

    await createCsv(filtered, "filtered_conversations.csv");
    await createExcel(filtered, "filtered_conversations.xlsx");

    console.log(`Finalizado processamento do deal: ${dealId}`);
  }

  console.log("Processo concluído!");
}

main().catch(console.error);
