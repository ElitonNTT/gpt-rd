import { getConversations, getDealDetails } from "./services/rdStation";
import { createCsv, createExcel } from "./services/fileWriter";
import { filterConversations } from "./services/openAi";

async function main() {
  console.log("Carregando IDs de conversas...");
  const conversations = await getConversations();
  const allActivities = conversations.flatMap(
    (pageData) => pageData.activities
  );
  const uniqueDealIds = [...new Set(allActivities.map((c: any) => c.deal_id))];

  console.log("Iniciando processamento de cada deal...");
  for (const dealId of uniqueDealIds) {
    console.log(`Processando deal: ${dealId}`);

    // Obter detalhes do negócio
    const dealDetails = await getDealDetails(dealId);
    if (!dealDetails) {
      console.warn(`Nenhum detalhe encontrado para deal: ${dealId}`);
      continue;
    }

    // Filtrar conversas com IA
    const relevantConversations = allActivities.filter(
      (c: any) => c.deal_id === dealId
    );
    const formattedConversations = relevantConversations.map((conv: any) => ({
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

    // Escrever no arquivo
    await createCsv(filtered, "filtered_conversations.csv");
    await createExcel(filtered, "filtered_conversations.xlsx");

    // Enviar curso ao integrador
    // for (const data of filtered) {
    //   await sendCourseToIntegrator(data.pessoa, data.curso, data.consultor);
    // }

    console.log(`Finalizado processamento do deal: ${dealId}`);
  }

  console.log("Processo concluído!");
}

main().catch(console.error);
