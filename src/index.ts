import { getConversationDetails } from "./services/rdStation";
import { createCsv, createExcel } from "./services/fileWriter";
import { filterConversations } from "./services/openAi";
async function main() {
  console.log("Carregando dados do RD Station...");
  const conversations = await getConversationDetails();
  console.log("Conversas encontradas:", JSON.stringify(conversations, null, 2));

  // console.log("Filtrando conversas com IA...");
  // const filtered = await filterConversations(conversations);

  console.log("Criando arquivos...");
  await createCsv(conversations);
  await createExcel(conversations);

  // console.log("Processo concluído!");
}

main().catch(console.error);
