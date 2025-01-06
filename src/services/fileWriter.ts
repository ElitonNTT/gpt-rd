import { createObjectCsvWriter } from "csv-writer";
import * as ExcelJS from "exceljs";

export async function createCsv(
  data: any,
  filename = "filtered_conversations.csv"
) {
  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: [
      { id: "pessoa", title: "PESSOA" },
      { id: "curso", title: "CURSO" },
      { id: "consultor", title: "CONSULTOR" },
    ],
  });
  await csvWriter.writeRecords(data);
  console.log(`CSV criado: ${filename}`);
}

export async function createExcel(
  data: any,
  filename = "filtered_conversations.xlsx"
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Conversations");

  sheet.columns = [
    { header: "Pessoa", key: "pessoa" },
    { header: "Curso", key: "curso" },
    { header: "Consultor", key: "consultor" },
  ];
  sheet.addRows(data);

  await workbook.xlsx.writeFile(filename);
  console.log(`Excel criado: ${filename}`);
}
