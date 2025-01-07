import { getConversationDetails } from "./services/rdStation";
import { createCsv, createExcel } from "./services/fileWriter";
import { filterConversations } from "./services/openAi";

async function main() {
  console.log("Carregando dados do RD Station...");
  const conversations = await getConversationDetails();

  console.log("Filtrando conversas com IA...");
  const filtered = await filterConversations(conversations);
  console.log("Conversas filtradas:", JSON.stringify(filtered, null, 2));

  console.log("Criando arquivos...");
  await createCsv(filtered);
  await createExcel(filtered);

  console.log("Processo concluído!");
}

main().catch(console.error);
