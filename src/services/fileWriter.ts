import { createObjectCsvWriter } from "csv-writer";
import * as ExcelJS from "exceljs";
import fs from "fs";

export async function createCsv(
  data: any,
  filename = "filtered_conversations.csv"
) {
  const fileExists = fs.existsSync(filename);

  const csvWriter = createObjectCsvWriter({
    path: filename,
    append: fileExists,
    header: [
      { id: "pessoa", title: "PESSOA" },
      { id: "curso", title: "CURSO" },
      { id: "consultor", title: "CONSULTOR" },
    ],
  });

  await csvWriter.writeRecords(data);
  console.log(`CSV atualizado: ${filename}`);
}

export async function createExcel(
  data: any,
  filename = "filtered_conversations.xlsx"
) {
  const workbook = new ExcelJS.Workbook();

  // Verificar se o arquivo já existe
  if (fs.existsSync(filename)) {
    await workbook.xlsx.readFile(filename);
  }

  const sheet =
    workbook.getWorksheet("Conversations") ||
    workbook.addWorksheet("Conversations");

  sheet.columns = [
    { header: "Pessoa", key: "pessoa" },
    { header: "Curso", key: "curso" },
    { header: "Consultor", key: "consultor" },
  ];

  sheet.addRows(data);

  await workbook.xlsx.writeFile(filename);
  console.log(`Excel atualizado: ${filename}`);
}
